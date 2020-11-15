import {prop, getModelForClass, Ref} from "@typegoose/typegoose"
import {Field, ObjectType, ID, InputType} from "type-graphql"
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
}

@InputType()
export class PropertyReviewInput {

  @Field({nullable: false})
  withReviews: boolean;

  @Field({nullable: true})
  offset: number;

  @Field({nullable: true})
  count: number;
}

@ObjectType()
export  class PropertyAPIResponse extends APIResult(Property) {}

export const PropertyModel = getModelForClass(Property)