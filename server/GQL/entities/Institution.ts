import { prop, getModelForClass } from "@typegoose/typegoose"
import { Field, ObjectType, InputType, ID } from "type-graphql";
import {APIResult} from "."

@ObjectType({description: "Institution Location"})
class InstitutionLocationInfo {
  @Field()
  @prop()
  address: string;
  
  @Field()
  @prop()
  city: string;
  
  @Field()
  @prop()
  state: string;
  
  @Field()
  @prop()
  zip: string;
}

@ObjectType({description: "Institution Model"})
export class Institution {

  @Field(() => ID)
  _id: string;

  @Field()
  @prop()
  name: string;

  @Field()
  @prop()
  location: InstitutionLocationInfo;

  @Field()
  @prop()
  s3_thumb_key: string;
}

@ObjectType()
export class InstitutionAPIResponse extends APIResult(Institution) {}

export const InstitutionModel = getModelForClass(Institution)