import {prop, getModelForClass} from "@typegoose/typegoose"
import {Field, ObjectType, ArgsType, ID, InputType, Int} from "type-graphql"
import {APIResult} from "."
import {Property} from './Property'
import {Landlord} from './Landlord'

export type StatusType = "in-review" | "confirmed" | "declined"

@ObjectType({description: "Ownership Confirmation Activity"})
export class ConfirmationActivity {

  @Field(type => String)
  @prop({type: String})
  user_id: string;

  @Field(type => String)
  @prop({type: String})
  user_type: 'landlord' | 'student';

  @Field(type => String)
  @prop({type: String})
  message: string;

  @Field(type => String)
  @prop({type: String})
  date_submitted: string;

  @Field(type => String, {nullable: true})
  @prop({type: String})
  full_name?: string;
}

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

@ObjectType({description: "Describes a status change in an ownership"})
export class StatusChangeInfo {

  @Field(type => String)
  @prop({type: String})
  status_changer_user_id: string;

  @Field(type => String)
  @prop({type: String})
  status_changer_user_type: 'landlord' | 'student';

  @Field(type => String)
  @prop({type: String})
  date_changed: string;

  @Field(type => String)
  @prop({type: String})
  changed_from: StatusType;

  @Field(type => String)
  @prop({type: String})
  changed_to: StatusType;

  @Field(type => String, {nullable: true})
  @prop({type: String})
  status_changer_full_name?: string;

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
  status: StatusType;

  @Field(type => [OwnershipDocument])
  @prop({type: OwnershipDocument})
  ownership_documents: OwnershipDocument[]

  @Field(type => [ConfirmationActivity])
  @prop({type: [ConfirmationActivity]})
  confirmation_activity: ConfirmationActivity[];

  @Field(type => [StatusChangeInfo])
  @prop({type: [StatusChangeInfo]})
  status_change_history: StatusChangeInfo[]
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