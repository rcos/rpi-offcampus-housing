import {prop, getModelForClass, Ref} from "@typegoose/typegoose"
import {Field, ObjectType, ID, InputType, Int} from "type-graphql"
import {APIResult} from "."
import {ObjectId} from "mongodb"

@ObjectType({description: "Ownership Document Information"})
export class OwnershipDocument {

  @Field(type => String)
  @prop({type: String})
  s3_doc_key: string;

  @Field(type => String)
  @prop({type: String})
  format: string;

  @Field(type => String)
  @prop({type: String})
  date_uploaded: string;
}

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

  @Field(type => [OwnershipDocument])
  @prop({type: OwnershipDocument})
  ownership_documents: OwnershipDocument[]
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