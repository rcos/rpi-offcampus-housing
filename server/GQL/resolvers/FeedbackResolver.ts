import {Resolver, Mutation, Arg, Query} from 'type-graphql'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
import {
    Feedback,
    FeedbackModel,
    FeedbackAPIResponse
} from '../entities/Feedback'
const ObjectId = mongoose.Types.ObjectId

@Resolver()
export class FeedbackResolver {

    /**
     * submitFeedback()
     * @desc Create a new feedback entry with the message, submitter info,
     * and tags describing the category the feedback belongs in.
     * 
     * @param submitter_id: string => The id of the submitter
     * @param user_type: string => The type of the user (student | landlord)
     * @param message: string => The string message of the feedbck
     * @param tags: string[] => The tags associated with the feedback entry
     */
    @Mutation(() => FeedbackAPIResponse)
    async submitFeedback(
        @Arg("submitter_id") submitter_id: string,
        @Arg("user_type") user_type: string,
        @Arg("message") message: string,
        @Arg("tags", type => [String]) tags: string[]): Promise<FeedbackAPIResponse>
        {

            console.log(chalk.bgBlue(`👉 submitFeedback()`))
            console.log(`user type => ${user_type}`)

            if (user_type != 'landlord' && user_type != 'student') {
                console.log(chalk.bgRed(`❌ Error: User type must be landlord or student.`))
                return {
                    success: false,
                    error: "Invalid user type"
                }
            }

            let new_feedback: DocumentType<Feedback> = new FeedbackModel()
            new_feedback.submitter_id = submitter_id;
            new_feedback.user_type = user_type;
            new_feedback.message = message;
            new_feedback.tags = tags;
            new_feedback.date_submitted = new Date().toISOString()

            let saved_feedback: DocumentType<Feedback> = await new_feedback.save();
            if (saved_feedback) {
                console.log(chalk.bgGreen(`✔ Successfully created new feedback!`))
                return {
                    success: true,
                    data: saved_feedback
                }
            }

            else {
                console.log(chalk.bgRed(`❌ Error: Problem creating new feedback`))
                return {
                    success: false,
                    error: "Internal server error"
                }
            }

        }
}