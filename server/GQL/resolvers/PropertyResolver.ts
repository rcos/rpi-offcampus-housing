import {Resolver, Mutation, Arg, Query, Int} from 'type-graphql'
import {Property, 
  PropertyAPIResponse, 
  PropertyModel, 
  PropertyReviewInput,
  PropertySearchInput,
  PropertyList,
  AddressVerificationAPIResponse,
  PropertyListAPIResponse,
  PropertyImageInfo,
  PropertyDetails} from '../entities/Property'
import {Landlord, LandlordModel} from '../entities/Landlord'
import {Ownership, OwnershipModel, StatusType} from '../entities/Ownership'
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

  @Query(() => PropertyAPIResponse)
  async getPropertyOwnedByLandlord(
    @Arg("property_id") property_id: string,
    @Arg("landlord_id") landlord_id: string
  ): Promise<PropertyAPIResponse>
  {

    console.log(chalk.bgBlue(`👉 getPropertyOwnedByLandlord`))
    if (!ObjectId.isValid(property_id) || !ObjectId.isValid(landlord_id)) {
      console.log(chalk.bgRed(`❌ Error: Invalid object ids provided`))
      return {
        success: false,
        error: `Invalid ids provided`
      }
    }

    let ownership_: DocumentType<Ownership> = await OwnershipModel.findOne({
      property_id,
      landlord_id
    }) as DocumentType<Ownership>

    if (!ownership_) {
      console.log(chalk.bgRed(`❌ Error: Ownership does not exist for landlord ${landlord_id} and property ${property_id}`))
      return {
        success: false,
        error: `No access`
      }
    }
    
    let property_: DocumentType<Property> = await PropertyModel.findById(property_id) as DocumentType<Property>
    if (!property_) {
      console.log(chalk.bgRed(`❌ Error: Property does not exist`))
      return {
        success: false,
        error: `No property found`
      }
    }

    console.log(chalk.bgGreen(`✔ Successfully retrieved property ${property_id} owned by ${landlord_id}`))
    return {
      success: true,
      data: property_
    }

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

  /**
   * getPropertiesForLandlord()
   * @decs Get the list of properties that this landlord owns that
   * have there ownerships confirmed
   * 
   * @param landlord_id: string => The id of the landlord to get the properties of 
   */
  @Query(() => PropertyListAPIResponse)
  async getPropertiesForLandlord(
    @Arg("landlord_id") landlord_id: string,
    @Arg("status", type => String, {nullable: true}) status: StatusType
  ): Promise<PropertyListAPIResponse> {

    console.log(chalk.bgBlue(`👉 getPropertiesForLandlord()`))
    if (!ObjectId.isValid(landlord_id)) {
      console.log(chalk.bgRed(`❌ Error: landlord_id (${landlord_id}) is not a valid objec tid.`))
      return {
        success: false, error: `Invalid landlord_id`
      }
    }

    let ownerships: DocumentType<Ownership>[] = await OwnershipModel.find({landlord_id}) as DocumentType<Ownership>[]
    let _properties: Promise<DocumentType<Property>>[] = ownerships
      .filter((ownership: DocumentType<Ownership>) => status != null ? ownership.status == status : ownership.status == 'confirmed')
      .map(async (ownership: DocumentType<Ownership>, i: number) => await PropertyModel.findById(ownership.property_id) as DocumentType<Property>)

    let properties = []
    for (let i = 0; i < _properties.length; ++i) properties.push(await _properties[i])

    return {
      success: true,
      data: { properties }
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

  @Mutation(() => PropertyAPIResponse)
  async updatePropertyDetails(
    @Arg("property_id", type => String, {nullable: false}) property_id: string,
    @Arg("description", type => String, {nullable: true}) description?: string,
    @Arg("rooms", type => Int, {nullable: true}) rooms?: number,
    @Arg("bathrooms", type => Int, {nullable: true}) bathrooms?: number,
    @Arg("sq_ft", type => Int, {nullable: true}) sq_ft?: number,
    @Arg("furnished", type => Boolean, {nullable: true}) furnished?: boolean,
    @Arg("has_washer", type => Boolean, {nullable: true}) has_washer?: boolean,
    @Arg("has_heater", type => Boolean, {nullable: true}) has_heater?: boolean,
    @Arg("has_ac", type => Boolean, {nullable: true}) has_ac?: boolean
  ): Promise<PropertyAPIResponse> 
  {

    console.log(chalk.bgBlue(`👉 updatePropertyDetails()`))
    if (!ObjectId.isValid(property_id)) {
      console.log(chalk.bgRed(`❌ Error: Property id is not a valid object id`))
      return { success: false, error: `property_id is not valid` }
    }
    let property: DocumentType<Property> = await PropertyModel.findById(property_id) as DocumentType<Property>
    if (!property) {
      console.log(chalk.bgRed(`❌ Error: No property found with id ${property_id}`))
      return { success: false, error: `No property found` }
    }

    // initialize details if the property doesn't have details
    if (!property.details) property.details = new PropertyDetails();
    
    // add the details provided
    if (description) property.details.description = description;
    if (rooms) property.details.rooms = rooms;
    if (bathrooms) property.details.bathrooms = bathrooms;
    if (sq_ft) property.details.sq_ft = sq_ft;
    if (furnished != null && furnished != undefined) property.details.furnished = furnished;
    if (has_washer != null && has_washer != undefined) property.details.has_washer = has_washer;
    if (has_heater != null && has_heater != undefined) property.details.has_heater = has_heater;
    if (has_ac != null && has_ac != undefined) property.details.has_ac = has_ac;

    let updated_property: DocumentType<Property> = await property.save () as DocumentType<Property>

    console.log(chalk.bgGreen(`✔ Successfully updated details for property (${property_id})`))
    return {
      success: true,
      data: updated_property
    }

  }

  @Mutation(() => PropertyAPIResponse)
  async addImagesToProperty(
    @Arg("property_id") property_id: string,
    @Arg("s3_keys", type => [String]) s3_keys: string[]
  ): Promise<PropertyAPIResponse> {

    console.log(chalk.bgBlue(`👉 addImagesToProperty()`))

    if (s3_keys.length == 0) {
      console.log(chalk.bgRed(`❌ Error: No images to add.`))
      return { success: false, error: `No data to add` }
    }

    if (!ObjectId.isValid(property_id)) {
      console.log(chalk.bgRed(`❌ Error: Property id ${property_id} is not a valid object id`))
      return { success: false, error: `Invalid object id`}
    }

    let property_: DocumentType<Property> = await PropertyModel.findById(property_id) as DocumentType<Property>
    if (!property_) {
      console.log(chalk.bgRed(`❌ Error: Property with id ${property_id} does not exist`))
      return { success: false, error: `Property not found`}
    }

    if (!property_.details) property_.details = new PropertyDetails()
    for (let i = 0; i < s3_keys.length; ++i) {
      let prop_image_info: PropertyImageInfo = {
        s3_key: s3_keys[i],
        date_uploaded: new Date().toISOString()
      }
      
      property_.details.property_images.push(prop_image_info)
    }

    // save property
    let saved_property: DocumentType<Property> = await property_.save() as DocumentType<Property>
    console.log(chalk.green(`✔ Successfully added ${s3_keys.length} images to property ${property_id}`))
    return {
      success: true,
      data: saved_property
    }
  }

  @Mutation(() => PropertyAPIResponse)
  async removeImageFromProperty(
    @Arg("property_id") property_id: string,
    @Arg("s3_key") s3_key: string
  ): Promise<PropertyAPIResponse>
  {
    console.log(chalk.bgBlue(`👉 removeImageFromProperty()`))

    if (!ObjectId.isValid(property_id)) {
      console.log(chalk.bgRed(`❌ Error: property_id ${property_id} is not a valid object id`))
      return {
        success: false,
        error: `Invalid property id provided`
      }
    }

    let property_: DocumentType<Property> = await PropertyModel.findById(property_id) as DocumentType<Property>
    if (!property_ ) {
      console.log(chalk.bgRed(`❌ Error: No property found`))
      return {
        success: false,
        error: `Property does not exist`
      }
    }

    if (property_.details) {
      property_.details.property_images = property_.details.property_images.filter((image_info:PropertyImageInfo) => {
        return image_info.s3_key != s3_key
      })

      let saved_property: DocumentType<Property> = await property_.save() as DocumentType<Property>
      console.log(chalk.bgGreen(`✔ Successfully removed ${s3_key} from property ${property_id}`))
      return {success: true, data: saved_property}
    }

    console.log(chalk.bgYellow(`Property ${property_id} does not have image ${s3_key} in its details`))
    return {success: true, data: property_}
  }
}