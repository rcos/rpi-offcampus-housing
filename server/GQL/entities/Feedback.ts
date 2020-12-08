import {prop, getModelForClass} from "@typegoose/typegoose"
import {Field, ObjectType, ArgsType, ID, InputType, Int} from "type-graphql"
import {APIResult} from "."

@ObjectType({description: "Feedback submission entry"})
export class Feedback {

    @Field(type => String)
    @prop({type: String})
    submitter_id: string;

    @Field(type => String)
    @prop({type: String})
    user_type: 'landlord' | 'student';

    @Field(type => String)
    @prop({type: String})
    message: string;

    @Field(type => String)
    @prop({type: String})
    date_submitted: string;

    @Field(type => [String])
    @ prop({type: [String]})
    tags: string[];
}

@ObjectType()
export class FeedbackAPIResponse extends APIResult(Feedback) {}

export const FeedbackModel = getModelForClass(Feedback)