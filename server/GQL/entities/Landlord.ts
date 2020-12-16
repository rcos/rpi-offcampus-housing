import {prop, getModelForClass} from "@typegoose/typegoose"
import {Field, ObjectType, ID, InputType} from "type-graphql"
import {APIResult} from "."

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

  @Field(type => String, {nullable: true})
  @prop({type: String})
  password?: string;
  
  @Field(type => String, {nullable: true})
  @prop({type: String})
  type?: String;

  @Field(type => String, {nullable: true})
  @prop({type: String})
  confirmation_key?: string;
}

@InputType()
export class LandlordInput implements Partial<Landlord> {
  @Field({nullable: true})
  _id: string;

  @Field({nullable: true})
  first_name: string;
  
  @Field({nullable: true})
  last_name: string;
  
  @Field({nullable: true})
  email: string;
  
  @Field({nullable: true})
  phone_number: string;
  
  @Field({nullable: true})
  password: string;
}

@ObjectType()
export class LandlordAPIResponse extends APIResult(Landlord) {}

export const LandlordModel = getModelForClass(Landlord)