import {Resolver, Mutation, Arg, Args, Query, Field} from 'type-graphql'
import {DocumentType, prop} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
import {Ownership, 
  OwnershipModel, 
  OwnershipAPIResponse,
  OwnershipCollectionAPIResponse,
  OwnershipDocumentInput,
  AddOwnershipArgs,
  OwnershipCollection} from '../entities/Ownership'
import {Property, PropertyModel} from '../entities/Property'
import {Landlord, LandlordModel} from '../entities/Landlord'

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

}