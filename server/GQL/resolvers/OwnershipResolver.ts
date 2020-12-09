import {Resolver, Mutation, Arg, Args, Query} from 'type-graphql'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
import {Ownership, 
  OwnershipModel, 
  OwnershipAPIResponse,
  OwnershipCollectionAPIResponse,
  OwnershipDocumentInput,
  ConfirmationActivity,
  AddOwnershipArgs,
  OwnershipCollection} from '../entities/Ownership'
import {Property, PropertyModel} from '../entities/Property'
import {Landlord, LandlordModel} from '../entities/Landlord'
import {Student, StudentModel} from '../entities/Student'
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
    ownership_ = await fillNamesForConfirmationActivities(ownership_)

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

    let under_review: DocumentType<Ownership>[] = await OwnershipModel.find({status: "in-review"})
    // fill the landlord_doc parts
    for (let i = 0; i < under_review.length; ++i) {
      under_review[i].landlord_doc = await LandlordModel.findById(under_review[i].landlord_id) as DocumentType<Landlord>
      under_review[i].property_doc = await PropertyModel.findById(under_review[i].property_id) as DocumentType<Property>
    }

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
    @Arg("landlord_id") landlord_id: string
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

    let property_docs: DocumentType<Property>[] = []
    for (let i = 0; i < ownerships.length; ++i) {
      if (!ObjectId.isValid(ownerships[i].property_id)) {
        console.error(`❌ Error: Ownership with id ${ownerships[i]._id} has an invalid property_id value of ${ownerships[i].property_id}`)
        return { success: false, error: `Data malformed` }
      }

      let property_: DocumentType<Property> | null = await PropertyModel.findById(ownerships[i].property_id) as DocumentType<Property>
      ownerships[i].property_doc = property_
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
    let saved_prop: DocumentType<Property> | null = await PropertyModel.findOne({location: prop_address})
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
      property_.location = prop_address;
      property_.sq_ft = -1;
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
    updated_ownership = await fillNamesForConfirmationActivities(updated_ownership)

    return {
      success: true,
      data: updated_ownership
    }

  }
}

const fillNamesForConfirmationActivities = async (ownership_: DocumentType<Ownership>): Promise<DocumentType<Ownership>> => {
  let name_map: {student: {[key: string]: string}, landlord: {[key: string]: string}} = {student: {}, landlord: {}}

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

  return ownership_;
}