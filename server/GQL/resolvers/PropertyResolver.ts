import {Resolver, Mutation, Arg, Query} from 'type-graphql'
import {Property, 
  PropertyAPIResponse, 
  PropertyModel, 
  PropertyReviewInput,
  PropertySearchInput,
  PropertyList,
  AddressVerificationAPIResponse,
  PropertyListAPIResponse} from '../entities/Property'
import {Landlord, LandlordModel} from '../entities/Landlord'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
const ObjectId = mongoose.Types.ObjectId

// setup usps webtools api
let usps: null | any = null
if (process.env.USPS_USER_ID as string) {
  let USPS = require('usps-webtools')
  usps = new USPS({
    server: 'http://production.shippingapis.com/ShippingAPI.dll',
    userId: (process.env.USPS_USER_ID as string),
    ttl: 10000 //TTL in milliseconds for request
  });
}


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

  @Query(() => PropertyListAPIResponse)
  async searchProperties(
    @Arg("searchOptions") {offset, count}:PropertySearchInput
  ): Promise<PropertyListAPIResponse>
  {

    let properties_ = await PropertyModel.find().skip(offset).limit(count).exec()
    return {
      success: true,
      data: {
        properties: properties_
      }
    }

  }

  @Query(() => AddressVerificationAPIResponse)
  async verifyAddress(
    @Arg("address_1") address_1: string,
    @Arg("address_2") address_2: string,
    @Arg("city") city: string,
    @Arg("state") state: string,
    @Arg("zip") zip: string
  ): Promise<AddressVerificationAPIResponse>
  {

    return new Promise((resolve, reject) => {
      usps.verify({
        street1: address_1,
        street2: address_2,
        city: city,
        state: state,
        zip: zip
      }, function(err: any, address: any) {
        // console.log(err, address);
        if (err) {
          resolve({
            success: false,
            error: "Invalid address"
          })
        }
        else resolve({
          success: true,
          data: {
            address_1: address.street1,
            address_2: address.street2,
            city: address.city,
            state: address.state,
            zip: address.zip
          }
        })
      });
    })

  }
}