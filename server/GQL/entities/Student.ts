import { prop, getModelForClass } from "@typegoose/typegoose"
import { Field, ObjectType, InputType, ID, Int } from "type-graphql";
import {APIResult} from "."
import {Property} from './Property'
import {ObjectId} from 'mongodb'
import mongoose from 'mongoose'

@ObjectType({description: "Student User Settinhs"})
export class StudentUserSettings {
  @Field(type => Boolean)
  recieve_email_notifications: boolean;
}

@ObjectType({description: "Cas Auth Information"})
class CasAuthInfo {
  @Field(type => String, { nullable: true })
  @prop({type: String})
  cas_id: String;
  
  @Field(type => String, { nullable: true })
  @prop({type: String})
  institution_id: String;
}

@ObjectType({description: "An array of collection entries"}) 
export class PropertyCollectionEntries{  
  @Field(type => [Property])
  @prop({ type: [Property] })
  collection_entries: Partial<Property>[];
}

@ObjectType({description: "Student model"})
export class Student {
  @Field(() => ID)
  _id: string;

  @Field()
  @prop()
  first_name: String;

  @Field()
  @prop()
  last_name: String;
  
  @Field()
  @prop()
  email: String;
  
  @Field()
  @prop()
  phone_number: String;

  @Field(type => CasAuthInfo, { nullable: true })
  @prop({ type: CasAuthInfo })
  auth_info: CasAuthInfo;

  @Field(type => [String], {nullable: true})
  @prop({type: [String]})
  saved_collection: string[];

  @Field(type => String, {nullable: true})
  @prop({type: String})
  type?: String;

  @Field(type => [String], {nullable: true})
  @prop({type: String})
  elevated_privileges?: string[]

  @Field(type => [String], {nullable: true})
  @prop({type: String})
  confirmation_key?: string;

  @Field(type => StudentUserSettings)
  user_settings: StudentUserSettings;
}

@InputType()
export class StudentInput implements Partial<Student> {

  @Field({ nullable: true })
  _id: string;

  @Field({ nullable: true })
  first_name: String;

  @Field({ nullable: true })
  last_name: String;
  
  @Field({ nullable: true })
  email: String;
}

@InputType()
export class CollectionFetchInput {

  @Field(type => Int)
  @prop({type: Int})
  offset: number;

  @Field(type => Int)
  @prop({type: Int})
  count: number;
}

@ObjectType()
export class StudentAPIResponse extends APIResult(Student) {}
@ObjectType()
export class PropertyCollectionEntriesAPIResponse extends APIResult(PropertyCollectionEntries) {}

export const StudentModel = getModelForClass(Student)