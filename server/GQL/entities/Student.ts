import { prop, getModelForClass } from "@typegoose/typegoose"
import { Field, ObjectType, ID } from "type-graphql";
import {APIResult} from "./APIResponse"

@ObjectType({description: "Cas Auth Information"})
class CasAuthInfo {
  @Field({ nullable: true })
  cas_id: String;
  
  @Field({ nullable: true })
  institution_id: String;
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
}

@ObjectType()
export class StudentAPIResponse extends APIResult(Student) {}

export const StudentModel = getModelForClass(Student)