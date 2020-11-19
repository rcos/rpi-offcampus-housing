import {prop, getModelForClass, Ref} from "@typegoose/typegoose"
import {Field, ObjectType, ID, InputType, Int} from "type-graphql"
import {APIResult} from "."
import {ObjectId} from "mongodb"

@ObjectType({description: "Property Ownership Document Information"})
export class Ownership {
  @Field(() => ID)
  _id: string;

  @Field(type => String, {nullable: true})
  @prop({type: String})
  property_id: string;

  @Field(type => String)
  @prop({type: String})
  landlord_id: string;

  @Field(type => String)
  @prop({type: String})
  date_submitted: string;

  @Field(type => String)
  @prop({type: String})
  status: "in-review" | "confirmed";

  @Field(type => [String])
  @prop({type: String})
  ownership_doc_s3_keys: string[]
}

@ObjectType({description: "Property Ownership Collection"})
export class OwnershipCollection {
  @Field(type => [Ownership])
  @prop({type: [Ownership]})
  ownerships: Ownership[]
}

@ObjectType()
export class OwnershipAPIResponse extends APIResult(Ownership) {}
@ObjectType()
export class OwnershipCollectionAPIResponse extends APIResult(OwnershipCollection) {}

export const OwnershipModel = getModelForClass(Ownership)