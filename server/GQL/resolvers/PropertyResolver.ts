import {Resolver, Mutation, Arg, Query} from 'type-graphql'
import {Property, PropertyAPIResponse, PropertyModel, PropertyReviewInput} from '../entities/Property'
import {Landlord, LandlordModel} from '../entities/Landlord'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
const ObjectId = mongoose.Types.ObjectId

@Resolver()
export class PropertyResolver {

  /**
   * getLandlord (_id: mongoose.Types.ObjectId, withReviews: boolean, withLandlord: boolean)
   * @desc This function returns the property with the specified id. If withReviews is true, it will
   *        return the review documents for the property. If withLandlord is true, it will
   *        also return the landlord that owns this property.
   * 
   * @param _id The id for the property to retrieve
   * @param reviewOptions
   *          withReviews: boolean => if true, the reviews of the property will be returned too
   *          offset: number => The offset to return the reviews by
   *          count: number => The amount of reviews to return
   * @param withLandlord 
   */
  @Query(() => PropertyAPIResponse)
  async getProperty(
    @Arg("_id") _id: string, 
    @Arg("reviewOptions") {withReviews, offset, count}: PropertyReviewInput,
    @Arg("withLandlord") withLandlord: boolean): Promise<PropertyAPIResponse> 
  {
    console.log(chalk.bgBlue(`👉 getLandlord(id)`))

    let property_: DocumentType<Property> | null = await PropertyModel.findById(_id)
    if (property_ == null) {
      console.log(chalk.bgRed(`❌ Error: No property exists with id ${_id}`))
      return { success: false, error: "No property found" }
    }

    // check for reviews
    if (withReviews) {
      // TODO fetch the reviews
    }

    let landlord_doc: DocumentType<Landlord> | null = null
    if (withLandlord) {
      landlord_doc = await LandlordModel.findById(property_.landlord)
      if (landlord_doc == null) {
        console.log(chalk.bgRed(`❌ Error: No landlord found with id ${property_.landlord}`))
        return {success: false, error: "No landlord found for this property"}
      }
    }

    // return the landlord
    // console.log(property_.toObject())
    console.log(property_.toObject())
    return {success: true, data: {
      ...property_.toObject(),
      landlord_doc: landlord_doc == null ? undefined : landlord_doc as Landlord
    }}

  }
}