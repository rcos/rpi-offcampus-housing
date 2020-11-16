import { prop, getModelForClass } from "@typegoose/typegoose"
import { Field, ObjectType, InputType, ID } from "type-graphql";
import {APIResult} from "."
import {Property} from './Property'

@ObjectType({description: "Cas Auth Information"})
class CasAuthInfo {
  @Field({ nullable: true })
  cas_id: String;
  
  @Field({ nullable: true })
  institution_id: String;
}

@ObjectType({description: "An array of collection entries"}) 
export class PropertyCollectionEntries{  
  @Field(type => [Property])
  @prop({ type: [Property] })
  collection_entries: Property[];
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

  @Field({ nullable: true })
  auth_info: CasAuthInfo;

  @Field(type => [String], {nullable: true})
  @prop({type: [String]})
  saved_collection: string[];
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

  @Field()
  offset: number;

  @Field()
  count: number;
}

@ObjectType()
export class StudentAPIResponse extends APIResult(Student) {}
@ObjectType()
export class PropertyCollectionEntriesAPIResponse extends APIResult(PropertyCollectionEntries) {}

export const StudentModel = getModelForClass(Student)