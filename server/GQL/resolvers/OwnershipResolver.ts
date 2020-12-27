import {Resolver, Mutation, Arg, Args, Query} from 'type-graphql'
import {DocumentType} from "@typegoose/typegoose"
import mongoose, {DocumentQuery} from 'mongoose'
import chalk from 'chalk'
import {Ownership, 
  OwnershipModel, 
  OwnershipAPIResponse,
  OwnershipCollectionAPIResponse,
  OwnershipDocumentInput,
  ConfirmationActivity,
  AddOwnershipArgs,
  StatusChangeInfo,
  StatusType,
  OwnershipCollection} from '../entities/Ownership'
import {Property, getAddress, PropertyModel} from '../entities/Property'
import {Landlord, LandlordModel} from '../entities/Landlord'
import {Student, StudentModel} from '../entities/Student'
import {NotificationsAPI} from '../../modules/NotificationsAPI'
// import util from 'util'

const ObjectId = mongoose.Types.ObjectId

@Resolver()
export class OwnershipResolver {

  /**
   * getOwnership(_id)
   * @param _id: string => The id for the ownership document we want
   * 
   * @desc Return the ownership document for the requested id. If no docunment
   * exists, an error will be returned.
   */
  @Query(() => OwnershipAPIResponse)
  async getOwnership(
    @Arg("_id") _id: string
  ): Promise<OwnershipAPIResponse> 
  {

    console.log(chalk.bgBlue(`👉 getOwnership(_id)`))
    if (!ObjectId.isValid(_id)) {
      console.log(chalk.bgRed(`❌ Error: Id is not valid.`))
      return {
        success: false, 
        error: "Invalid id given"
      }
    }

    let ownership_: DocumentType<Ownership> = await OwnershipModel.findById(_id) as DocumentType<Ownership>
    if (!ownership_) {
      console.log(chalk.bgRed(`❌ Error: No ownership document found`))
      return {
        success: false,
        error: "No data found"
      }
    }

    // get the property information and the landlord information
    ownership_.landlord_doc = await LandlordModel.findById(ownership_.landlord_id) as DocumentType<Landlord>
    ownership_.property_doc = await PropertyModel.findById(ownership_.property_id) as DocumentType<Property>
    ownership_ = await fillNamesForOwnershipMetadata(ownership_)

    console.log(chalk.bgGreen(`✔ Successfully retrieved ownership data`))
    return {
      success: true,
      data: ownership_
    }
  }
  
  /**
   * getOwnershipsInReview()
   * @desc Return the list of ownership documents that are currently under
   * review.
   */
  @Query(() => OwnershipCollectionAPIResponse)
  async getOwnershipsInReview() : Promise<OwnershipCollectionAPIResponse>
  {

    console.log(chalk.bgBlue(`👉 getOwnershipsInReview()`))
    let under_review: DocumentType<Ownership>[] = await OwnershipModel.find({status: "in-review"})
    // fill the landlord_doc parts

    let landlord_docs: DocumentQuery<DocumentType<Landlord> | null, DocumentType<Landlord>, {}>[] = []
    let property_docs: DocumentQuery<DocumentType<Property> | null, DocumentType<Property>, {}>[] = []
    for (let i = 0; i < under_review.length; ++i) {
      landlord_docs.push(LandlordModel.findById(under_review[i].landlord_id));
      property_docs.push(PropertyModel.findById(under_review[i].property_id));
    }

    for (let i = 0; i < under_review.length; ++i) {
      under_review[i].landlord_doc = await landlord_docs[i] as DocumentType<Landlord>
    }
    for (let i = 0; i < under_review.length; ++i) {
      under_review[i].property_doc = await property_docs[i] as DocumentType<Property>
    }

    console.log(chalk.bgGreen(`✔ Successfully retrieved ownerships in review (${under_review.length} documents)`))
    return {
      success: true,
      data: {
        ownerships: under_review
      }
    }
  }
  /**
   * getOwnershipsForLandlord(landlord_id)
   * @param landlord_id: string => The id of the landlord to query ownership of
   * 
   * @desc This query searches for all ownership documents that are owned by a landlord
   * with the given landlord_id
   */
  @Query(() => OwnershipCollectionAPIResponse)
  async getOwnershipsForLandlord(
    @Arg("landlord_id") landlord_id: string,
    @Arg("with_properties", type => Boolean, {nullable: true}) with_properties?: boolean,
    @Arg("with_landlord", type => Boolean, {nullable: true}) with_landlord?: boolean
  ): Promise<OwnershipCollectionAPIResponse>
  {

    console.log(chalk.bgBlue(`👉 getOwnershipsForLandlord()`))
    if (!ObjectId.isValid(landlord_id)) {
      console.log(chalk.bgRed(`❌ Error: Landlord id provided is not a valid object id`))
      return {
        success: false,
        error: "Invalid landlord id provided"
      }
    }

    // find the ownerships
    let ownerships: DocumentType<Ownership>[] = await OwnershipModel.find({landlord_id}) as DocumentType<Ownership>[]

    for (let i = 0; i < ownerships.length; ++i) {
      if (!ObjectId.isValid(ownerships[i].property_id)) {
        console.error(`❌ Error: Ownership with id ${ownerships[i]._id} has an invalid property_id value of ${ownerships[i].property_id}`)
        return { success: false, error: `Data malformed` }
      }
    }

    // get the properties
      let property_promises: DocumentQuery<DocumentType<Property> | null, DocumentType<Property>, {}>[] = []
      let landlord_promise: DocumentQuery<DocumentType<Landlord> | null, DocumentType<Landlord>, {}>;
    if (with_properties == true) {
      for (let i = 0; i < ownerships.length; ++i) property_promises.push(PropertyModel.findById(ownerships[i].property_id))
    }
    if (with_landlord == true) {
      landlord_promise = LandlordModel.findById(landlord_id)
    }

    for (let i = 0; i < property_promises.length && i < ownerships.length; ++i) ownerships[i].property_doc = await property_promises[i] as DocumentType<Property>
    if (with_landlord == true) {
      let landlord_: DocumentType<Landlord> = await landlord_promise! as DocumentType<Landlord>;
      for (let i = 0; i < ownerships.length; ++i) ownerships[i].landlord_doc = landlord_;
    }

    console.log(chalk.bgGreen(`✔ Successfully retrieved ${ownerships.length} ownership documents for landlord with id ${landlord_id}`))
    return {
      success: true,
      data: { ownerships }
    }
  }

  /**
   * getOwnershipConflicts
   * @desc Given the id to an ownership document, look through the collection of all ownership
   * documents and see if there area any conflicts with this ownership and other ownerships.
   * A conflict is represented where there are multiple ownership submissions for the same property.
   * 
   * @param ownership_id: string => The id of the ownership document to check conflicts for
   */
  @Query(() => OwnershipCollectionAPIResponse)
  async getOwnershipConflicts(
    @Arg("ownership_id") ownership_id: string
  ): Promise<OwnershipCollectionAPIResponse>
  {

    if (!ObjectId.isValid(ownership_id)) {
      console.log(chalk.bgRed(`❌ Error: Invalid ownership id ObjectID format (${ownership_id})`))
      return {error: "invalid ownership_id", success: false};
    }
    let ownership_doc: DocumentType<Ownership> = await OwnershipModel.findById(ownership_id) as DocumentType<Ownership>
    if (!ownership_doc) {
      console.log(chalk.bgRed(`❌ Error: Could not find ownership document for _id ${ownership_id}`))
      return {error: "ownership document deos not exist", success: false};
    }

    /**
     * !Conflict => conflict exists where multiple ownerships have the same property id
     */
    let conflicts: DocumentType<Ownership>[] = await OwnershipModel.find({property_id: ownership_doc.property_id})
    conflicts = conflicts.filter((ownership_: Ownership) => ownership_._id.toString() != ownership_id)

    // add the landlord information
    for (let i = 0; i < conflicts.length; ++i) {
      conflicts[i].landlord_doc = await LandlordModel.findById(conflicts[i].landlord_id) as DocumentType<Landlord>
    }

    return {
      success: true,
      data: {
        // only return the ownerships that do not include ourselves
        ownerships: conflicts
      }
    }
  }

  /**
   * createOwnershipReview (landlord_id, property_location)
   * @param landlord_id: string => The id for the landlord to assign ownership to
   * @param property_location: string => The address location to match ownership to
   * 
   * @desc This mutation creates a new ownership document for the landlord
   * and puts the ownership status as "in-review". Based on the property location,
   * try to find a property that exists or is closest to this property.
   * If one is found, assign the property_id of the ownership document to
   * the property.
   */
  @Mutation(() => OwnershipAPIResponse)
  async createOwnershipReview(
    @Arg("landlord_id") landlord_id: string,
    @Arg("address_line") address_line: string,
    @Arg("address_line_2") address_line_2: string,
    @Arg("city") city: string,
    @Arg("state") state: string,
    @Arg("zip_code") zip_code: string
  ): Promise<OwnershipAPIResponse>
  {

    console.log(chalk.bgBlue(`👉 createOwnershipReview()`))
    if (!ObjectId.isValid(landlord_id)) {
      console.log(chalk.bgRed(`❌ Error: Invalid landlord_id ${landlord_id}`))
      return {
        success: false,
        error: `Invalid landlord id provided`
      }
    }

    // TODO find matching property
    let prop_address = `${address_line}, ${address_line_2}${address_line_2 == "" ? '' : ','} ${city} ${state}, ${zip_code}`;
    let saved_prop: DocumentType<Property> | null = await PropertyModel.findOne({
      address_line,
      address_line_2,
      city,
      state,
      zip: zip_code
    })
    /*
    Let's assume USPS gives us 1 address representation for each unique address
    With that assumption, then any property address entered should match at most 1 property object
    in our database (0 if it is not yet in our db.)
    */
    if (saved_prop == null) {
      // if there is no property with this prop_address, then we can create a new property object and add
      // that to the ownership.
      let property_ = new PropertyModel();
      property_.landlord = landlord_id;
      property_.address_line = address_line;
      property_.address_line_2 = address_line_2;
      property_.city = city;
      property_.state = state;
      property_.zip = zip_code;
      saved_prop = await property_.save() as DocumentType<Property>;
    }

    let new_ownership: DocumentType<Ownership> = new OwnershipModel()
    // new_ownership.property_id = ???
    new_ownership.property_id = saved_prop._id;
    new_ownership.landlord_id = landlord_id;
    new_ownership.date_submitted = new Date().toISOString();
    new_ownership.status = "in-review";
    new_ownership.ownership_documents = [];
    let saved_ownership: DocumentType<Ownership> = await new_ownership.save() as DocumentType<Ownership>;

    // Send notification
    let landlord_: DocumentType<Landlord> = await LandlordModel.findById(landlord_id) as DocumentType<Landlord>
    if (landlord_) {
      NotificationsAPI.getSingleton().sendNotification(landlord_, {
        title: "Your Property Is In-Review",
        excerpt: `Your property submission for ${address_line}, ${address_line_2 == "" ? '' : ` ${address_line_2}, `} ${city} ${state}, ${zip_code} is in-review.`,
        body: `Your property submission for ${address_line}, ${address_line_2 == "" ? '' : ` ${address_line_2}, `} ${city} ${state}, ${zip_code}
               is under review. Our moderation team will go through your submission to ensure that the property ownership information is accurate.
               We will contact you once we have approved of the infroamtion.`
      }, {
        sendEmailNotifiation: true,
        sendPushNotification: true
      })
    }

    console.log(chalk.bgGreen(`✔ Successfully created new ownership for landlord!`))
    return {
      success: true,
      data: saved_ownership
    }

  }
  
  /**
   * createOwnershipReview(ownership_id, documents_info)
   * @param ownership_id: string => The ObjectId of the ownership document
   * to store the document information into.
   * @param documents_info: OwnershipDocumentInput => The list of document
   * informations that need to be added to the ownership document.
   * 
   * @desc Adds the documents from documents_info to the ownership
   * document with the specified ownership_id.
   * Returns the updated ownership document
   */
  @Mutation(() => OwnershipAPIResponse)
  async addOwnershipDocuments(
    @Args() {
      ownership_id,
      documents_info
    }: AddOwnershipArgs
  ): Promise<OwnershipAPIResponse>
  {

    console.log(chalk.bgBlue(`👉 addOwnershipDocuments(ownership_id, documents_info)`))

    if (!ObjectId.isValid(ownership_id)) {
      console.log(chalk.bgRed(`❌ Error: Invalid ObjectId format for ownership_id`))
      return {
        success: false,
        error: "Invalid id format"
      }
    }
    let ownership_doc: DocumentType<Ownership> | null = await OwnershipModel.findById(ownership_id)
    if (ownership_doc == null) {
      console.log(chalk.bgRed(`❌ Error: No ownership document with id ${ownership_id}`))
      return {
        success: false,
        error: "Invalid ownership id"
      }
    }

    // update the documents list
    ownership_doc.ownership_documents = [
      ... ownership_doc.ownership_documents,
      ... documents_info.map((doc_info: OwnershipDocumentInput) => {
        return {
          ... doc_info,
          date_uploaded: new Date().toISOString()
        }
      })
    ]

    let updated_ownership_doc: DocumentType<Ownership> = await ownership_doc.save() as DocumentType<Ownership>;
    return {
      success: true,
      data: updated_ownership_doc
    }

  }

  /**
   * addOwnershipConfirmationActivity()
   * @desc confirmation_activity => This is an array of messages sent by ownership_reviewers to update
   * the status of an ownership document that is in-review. This is so that any other ownership_reviewer
   * that looks at the in-review form can see what other reviewers have done, for example, if they have
   * already gotten in contact with the landlord or sent messages or approved that their documents are
   * real, etc.
   * 
   * @param ownership_id => The id of the ownership document to add activity to
   * @param user_id => The id of the user that is updating the activity
   * @param user_type => The type of user that is interactinv with the activity (student / landlord)
   * @param message => The message describing the activity that it is being updated with
   * @param date_submitted => The ISO string date the activity update was submitted
   */
  @Mutation(() => OwnershipAPIResponse)
  async addOwnershipConfirmationActivity(
    @Arg("ownership_id") ownership_id: string,
    @Arg("user_id") user_id: string,
    @Arg("user_type") user_type: string,
    @Arg("message") message: string,
    @Arg("date_submitted") date_submitted: string
  ): Promise<OwnershipAPIResponse>
  {

    console.log(chalk.bgBlue(`👉 getOwnershipConfirmationActivity`))
    if (!['landlord', 'student'].includes(user_type)) {
      console.log(chalk.bgRed(`❌ Error: user_type is not student / landlord`))
      return {
        success: false,
        error: 'Invalid user type'
      }
    }

    if (!ObjectId.isValid(user_id)) {
      console.log(chalk.bgRed(`❌ Error: user_id is not a valid object id`))
      return {
        success: false,
        error: 'Invalid id format for user_id'
      }
    }

    if (!ObjectId.isValid(ownership_id)) {
      console.log(chalk.bgRed(`❌ Error: ownership_id is not a valid object id`))
      return {
        success: false,
        error: 'Invalid id format for ownership_id'
      }
    }

    let ownership_doc: DocumentType<Ownership> = await OwnershipModel.findById(ownership_id) as DocumentType<Ownership>
    if (!ownership_id) {
      console.log(chalk.bgRed(`❌ Error: No ownership document wih id ${ownership_id}`))
      return {
        success: false,
        error: 'Invalid ownership doc id'
      }
    }

    let new_activity: ConfirmationActivity = new ConfirmationActivity()
    new_activity.user_id = user_id
    new_activity.user_type = user_type as ('landlord' | 'student')
    new_activity.message = message
    new_activity.date_submitted = date_submitted

    if (ownership_doc.confirmation_activity == null) ownership_doc.confirmation_activity = [new_activity]
    else ownership_doc.confirmation_activity.push(new_activity)
    
    let updated_ownership: DocumentType<Ownership> = await ownership_doc.save() as DocumentType<Ownership>

    // update the fullnames.
    updated_ownership = await fillNamesForOwnershipMetadata(updated_ownership)

    return {
      success: true,
      data: updated_ownership
    }

  }

  /**
   * changeOwnershipStatus ()
   * @desc Change the status of an ownership documnet between
   * 'in-review', 'confirmed' or 'declined'
   * 
   * @param ownership_id: string => The id of the ownership document to change the status of 
   * @param new_status: string => The new status to set the document to
   */
  @Mutation(() => OwnershipAPIResponse)
  async changeOwnershipStatus(
    @Arg("ownership_id") ownership_id: string,
    @Arg("new_status") new_status: 'in-review' | 'confirmed' | 'declined',
    @Arg("status_changer_user_id") status_changer_user_id: string,
    @Arg("status_changer_user_type") status_changer_user_type: 'landlord' | 'student',
    @Arg("with_landlord") with_landlord: boolean,
    @Arg("with_property") with_property: boolean
  ): Promise<OwnershipAPIResponse>
  {
    console.log(chalk.bgBlue(`👉 changeOwnershipStatus()`))

    if (!ObjectId.isValid(ownership_id)) {
      console.log(chalk.bgRed(`❌ Error: ownership id is not a valid object id`));
      return {
        success: false,
        error: 'Invalid ownership_id'
      }
    }

    let ownership_doc: DocumentType<Ownership> = await OwnershipModel.findById(ownership_id) as DocumentType<Ownership>;
    if (!ownership_doc) {
      console.log(chalk.bgRed(`❌ Error: No ownership document with the id ${ownership_id}`))
      return { success: false, error: 'No ownership found' }
    }

    let landlord_: DocumentType<Landlord> = await LandlordModel.findById(ownership_doc.landlord_id) as DocumentType<Landlord>
    let property_: DocumentType<Property> = await PropertyModel.findById(ownership_doc.property_id) as DocumentType<Property>

    let old_status: StatusType = ownership_doc.status;
    if (ownership_doc.status != new_status) {
      ownership_doc.status = new_status;

      let status_change_info: StatusChangeInfo = new StatusChangeInfo()
      status_change_info.status_changer_user_id = status_changer_user_id
      status_change_info.status_changer_user_type = status_changer_user_type
      status_change_info.date_changed = new Date().toISOString()
      status_change_info.changed_from = old_status;
      status_change_info.changed_to = new_status;

      ownership_doc.status_change_history.push(status_change_info)
      ownership_doc = await ownership_doc.save() as DocumentType<Ownership>

      // send notification about the cahnge
      if (landlord_ && property_) {
        NotificationsAPI.getSingleton().sendNotification(landlord_, {
          title: `Property Ownership Status Changed`,
          excerpt: `The status of your property ownership has changed from ${old_status} to ${new_status}`,
          body: `The status of your property at ${getAddress(property_)} has changed from ${old_status} to ${new_status}`
        }, {
          sendEmailNotifiation: true,
          sendPushNotification: true
        })
      }
    }


    // get the landlord & property information
    if (with_landlord) {
      ownership_doc.landlord_doc = landlord_;
    }
    if (with_property) {
      ownership_doc.property_doc = property_;
    }

    console.log(chalk.bgGreen(`✅ Successfully changed status of ownership ${ownership_id} from ${old_status} to ${new_status}`))
    return {success: true, data: ownership_doc}
  }
}

/**
 * Given the ownership document, store the names for each entry in the confirmation_activity
 * and status_change_history within their corresponding documents.
 * @param ownership_ 
 */
const fillNamesForOwnershipMetadata = async (ownership_: DocumentType<Ownership>): Promise<DocumentType<Ownership>> => {
  let name_map: {student: {[key: string]: string}, landlord: {[key: string]: string}} = {student: {}, landlord: {}}

  // check confirmation activity first
  for (let i = 0; i < ownership_.confirmation_activity.length; ++i) {

    if (ownership_.confirmation_activity[i].user_type == 'student') {
      if (!Object.keys(name_map.student).includes(ownership_.confirmation_activity[i].user_id)) {
        let student_doc: DocumentType<Student> = await StudentModel.findById(ownership_.confirmation_activity[i].user_id) as DocumentType<Student>
        name_map.student[ownership_.confirmation_activity[i].user_id] = `${student_doc.first_name} ${student_doc.last_name}`
      }
      ownership_.confirmation_activity[i].full_name = name_map.student[ownership_.confirmation_activity[i].user_id]
    }
    else if (ownership_.confirmation_activity[i].user_type == 'landlord') {
      if (!Object.keys(name_map.landlord).includes(ownership_.confirmation_activity[i].user_id)) {
        let landlord_doc: DocumentType<Landlord> = await LandlordModel.findById(ownership_.confirmation_activity[i].user_id) as DocumentType<Landlord>
        name_map.landlord[ownership_.confirmation_activity[i].user_id] = `${landlord_doc.first_name} ${landlord_doc.last_name}`
      }
      ownership_.confirmation_activity[i].full_name = name_map.landlord[ownership_.confirmation_activity[i].user_id]
    }

  }

  // check status change history
  for(let i = 0; i < ownership_.status_change_history.length; ++i) {

    if (ownership_.status_change_history[i].status_changer_user_type == 'student') {
      if (!Object.keys(name_map.student).includes(ownership_.status_change_history[i].status_changer_user_id)) {
        let student_doc: DocumentType<Student> = await StudentModel.findById(ownership_.status_change_history[i].status_changer_user_id) as DocumentType<Student>
        name_map.student[ownership_.status_change_history[i].status_changer_user_id] = `${student_doc.first_name} ${student_doc.last_name}`
      }
      ownership_.status_change_history[i].status_changer_full_name = name_map.student[ownership_.status_change_history[i].status_changer_user_id]
    }

    else if (ownership_.status_change_history[i].status_changer_user_type == 'landlord') {
      if (!Object.keys(name_map.landlord).includes(ownership_.status_change_history[i].status_changer_user_id)) {
        let landlord_doc: DocumentType<Landlord> = await LandlordModel.findById(ownership_.status_change_history[i].status_changer_user_id) as DocumentType<Landlord>
        name_map.landlord[ownership_.status_change_history[i].status_changer_user_id] = `${landlord_doc.first_name} ${landlord_doc.last_name}`
      }
      ownership_.status_change_history[i].status_changer_full_name = name_map.landlord[ownership_.status_change_history[i].status_changer_user_id]
    }

  }

  return ownership_;
}