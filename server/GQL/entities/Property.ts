import {prop, getModelForClass, Ref} from "@typegoose/typegoose"
import {Field, ObjectType, ID, InputType, Int} from "type-graphql"
import {APIResult} from "."
import {ObjectId} from "mongodb"

import {Landlord} from './Landlord'

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

  @Field()
  @prop()
  location: string;

  @Field()
  @prop()
  sq_ft: number;

  /**
   * Properties that have been submitted by landlords to add
   * to their account will have a submission_id. These properties
   * need to be vetted manually before adding it to the landlord's
   * properties.
   */
  @Field({nullable: true})
  @prop()
  submission_id?: string;
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

@ObjectType()
export  class PropertyAPIResponse extends APIResult(Property) {}
@ObjectType()
export  class PropertyListAPIResponse extends APIResult(PropertyList) {}

export const PropertyModel = getModelForClass(Property)