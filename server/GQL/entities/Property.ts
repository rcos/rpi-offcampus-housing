import {prop, DocumentType, getModelForClass, Ref} from "@typegoose/typegoose"
import { type } from "os";
import {Field, ObjectType, ID, InputType, Int, Float} from "type-graphql"
import {APIResult} from "."

import {Landlord} from './Landlord'

@ObjectType({description: "Property Image info"})
export class PropertyImageInfo {
  @Field(type => String)
  @prop({type: String})
  s3_key: string;

  @Field(type => String)
  @prop({type: String})
  date_uploaded: string;
}

@ObjectType({description: "Details describing the property"})
export class PropertyDetails {

  @Field(type => String)
  @prop({type: String})
  description: string;

  @Field(type => Int)
  @prop()
  rooms: number;

  @Field(type => Int)
  @prop()
  bathrooms: number;

  @Field(type => Float)
  @prop()
  sq_ft: number;

  @Field(type => Boolean)
  @prop({type: Boolean})
  furnished: boolean;

  @Field(type => Boolean)
  @prop({type: Boolean})
  has_washer: boolean;

  @Field(type => Boolean)
  @prop({type: Boolean})
  has_heater: boolean;
  
  @Field(type => Boolean)
  @prop({type: Boolean})
  has_ac: boolean;

  @Field(type => [PropertyImageInfo])
  @prop({type: [PropertyImageInfo]})
  property_images: PropertyImageInfo[];
}

@ObjectType({description: "Property model"})
export class Property {
  @Field(() => ID)
  _id: string;

  @Field()
  @prop()
  landlord: string;

  @Field({nullable: true})
  @prop()
  landlord_doc?: Landlord;

  @Field(type => String)
  @prop({type: String})
  address_line: string;
  
  @Field(type => String, {nullable: true})
  @prop({type: String})
  address_line_2?: string;
  
  @Field(type => String)
  @prop({type: String})
  city: string;

  @Field(type => String)
  @prop({type: String})
  state: string;
  
  @Field(type => String)
  @prop({type: String})
  zip: string;

  @Field(type => PropertyDetails, {nullable: true})
  @prop({type: PropertyDetails})
  details?: PropertyDetails;
}

export const getAddress = (property_: DocumentType<Property>): string => {
  return `${property_.address_line}, ${property_.address_line_2 == "" ? '' : `${property_.address_line_2}, ${property_.city} ${property_.state}, ${property_.zip}`}`
}

@InputType()
export class PropertyReviewInput {

  @Field(type => Boolean,{nullable: false})
  @prop({type: Boolean})
  withReviews: boolean;

  @Field(type => Int, {nullable: true})
  @prop({type: Int})
  offset: number;

  @Field(type => Int, {nullable: true})
  @prop({type: Int})
  count: number;
}

@InputType()
export class PropertySearchInput {

  @Field(type => Int, {nullable: true})
  @prop({type: Int})
  offset: number;

  @Field(type => Int, {nullable: true})
  @prop({type: Int})
  count: number;
}

@ObjectType({description: "Collection of properties"})
export class PropertyList {
  @Field(type => [Property])
  @prop({type: [Property]})
  properties: Property[]
}

@ObjectType({description: "Response from USPS Address Verify API"})
export class AddressVerification {

  @Field(type => String)
  @prop({type: String})
  address_1: string;
  
  @Field(type => String)
  @prop({type: String})
  address_2: string;
  
  @Field(type => String)
  @prop({type: String})
  city: string;
  
  @Field(type => String)
  @prop({type: String})
  state: string;

  @Field(type => String)
  @prop({type: String})
  zip: string;
}

@ObjectType()
export  class PropertyAPIResponse extends APIResult(Property) {}
@ObjectType()
export  class PropertyListAPIResponse extends APIResult(PropertyList) {}
@ObjectType()
export class AddressVerificationAPIResponse extends APIResult(AddressVerification) {}

export const PropertyModel = getModelForClass(Property)