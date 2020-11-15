import {prop, getModelForClass} from "@typegoose/typegoose"
import {Field, ObjectType, ID} from "type-graphql"
import {APIResult} from "./APIResponse"

@ObjectType({description: "Landlord model"})
export class Landlord {
  @Field(() => ID)
  _id: string;

  @Field()
  @prop()
  first_name: string;

  @Field()
  @prop()
  last_name: string;

  @Field()
  @prop()
  email: string;

  @Field({ nullable: true })
  @prop()
  phone_number: string;

  @Field()
  @prop()
  password: string;
}

@ObjectType()
export class LandlordAPIResponse extends APIResult(Landlord) {}

export const LandlordModel = getModelForClass(Landlord)