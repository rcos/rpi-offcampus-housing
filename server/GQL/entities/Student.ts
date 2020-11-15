import { prop as Property, getModelForClass } from "@typegoose/typegoose"
import { Field, ObjectType, ID } from "type-graphql";

@ObjectType({description: "Student model"})
export class Student {
  @Field(() => ID)
  _id: string;

  @Field()
  @Property()
  first_name: String;

  @Field()
  @Property()
  last_name: String;
  
  @Field()
  @Property()
  email: String;
  
  @Field()
  @Property()
  phone_number: String;
}

export const StudentModel = getModelForClass(Student)