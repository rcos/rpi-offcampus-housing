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

  @Field(type => String)
  @prop({type: String})
  name: string;

  @Field(type => InstitutionLocationInfo)
  @prop({type: InstitutionLocationInfo})
  location: InstitutionLocationInfo;

  @Field(type => String, {nullable: true})
  @prop({type: String})
  s3_thumb_key: string;
}

@ObjectType({description: "A collection of Institutions"})
export class InstitutionList {

  @Field(type => [Institution])
  @prop({type: [Institution]})
  institutions: Institution[]
}

@ObjectType()
export class InstitutionAPIResponse extends APIResult(Institution) {}
@ObjectType()
export class InstitutionListAPIResponse extends APIResult(InstitutionList) {}

export const InstitutionModel = getModelForClass(Institution)