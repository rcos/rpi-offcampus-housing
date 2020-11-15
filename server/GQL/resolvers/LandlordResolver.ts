import {Resolver, Mutation, Arg, Query} from 'type-graphql'
import {Landlord, LandlordAPIResponse, LandlordModel} from '../entities/Landlord'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
const ObjectId = mongoose.Types.ObjectId


@Resolver()
export class LandlordResolver {

  @Query(() => LandlordAPIResponse)
  async getLandlord (@Arg("_id") _id: string): Promise<LandlordAPIResponse> {
    console.log(chalk.bgBlue(`👉 getLandlord(id)`));

    if (!ObjectId.isValid(_id)) {
      console.log(chalk.bgRed(`❌ Error: ${_id} is not a valid landlord id.`))
      return {success: false, error: "Invalid landlord id"}
    }
    let landlord_doc: DocumentType<Landlord> | null = await LandlordModel.findById(_id)
    if (landlord_doc == null) {
      console.log(chalk.bgRed(`❌ Error: No landlord with id ${_id} exists.`))
      return {success: false, error: "No landlord found"}
    }
    else {
      console.log(chalk.bgGreen(`✔ Successfully found landlord with id ${_id}`))
      return {success: true, data: landlord_doc}
    }
  }
}