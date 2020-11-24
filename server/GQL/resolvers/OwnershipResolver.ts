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
import { PropertyAlias } from 'aws-sdk/clients/iotsitewise'

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
    let saved_prop: DocumentType<Property>;
    
      // TEMPORARY: Create the property for the time being
      let property_ = new PropertyModel();
      property_.landlord = landlord_id;
      property_.location = `${address_line}, ${city} ${state}, ${zip_code}`;
      property_.sq_ft = -1;

      saved_prop = await property_.save() as DocumentType<Property>;
    

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