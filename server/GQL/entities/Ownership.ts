import {prop, getModelForClass, Ref} from "@typegoose/typegoose"
import {Field, ObjectType, ArgsType, ID, InputType, Int} from "type-graphql"
import {APIResult} from "."
import {Property} from './Property'
import {Landlord} from './Landlord'
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

  @Field(type => Property, {nullable: true})
  @prop({type: Property})
  property_doc?: Property;

  @Field(type => String)
  @prop({type: String})
  landlord_id: string;

  @Field(type => Landlord, {nullable: true})
  @prop({type: Landlord})
  landlord_doc?: Landlord;

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

@InputType({ description: "Input for adding ownership documents" })
export class OwnershipDocumentInput {

  @Field(type => String)
  @prop({type: String})
  s3_doc_key: string;

  @Field(type => String)
  @prop({type: String})
  format: string;
}

@ArgsType()
export class AddOwnershipArgs {

  @Field(type => String)
  ownership_id: string;

  @Field(type => [OwnershipDocumentInput])
  documents_info: OwnershipDocumentInput[];
}

@ObjectType()
export class OwnershipAPIResponse extends APIResult(Ownership) {}
@ObjectType()
export class OwnershipCollectionAPIResponse extends APIResult(OwnershipCollection) {}

export const OwnershipModel = getModelForClass(Ownership)