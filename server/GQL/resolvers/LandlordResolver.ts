import {Resolver, Mutation, Arg, Query} from 'type-graphql'
import {Landlord, LandlordAPIResponse, LandlordInput, LandlordModel} from '../entities/Landlord'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
import bcrypt from 'bcrypt'
const ObjectId = mongoose.Types.ObjectId

@Resolver()
export class LandlordResolver {

  /**
   * getLandlord(_id: mongoose.Types.ObjectId)
   * @desc Look for the landlord with the given id. If no landlord exists
   *        with that id, then the error field is provided and success is 
   *        set to false.
   * 
   * @param _id: mongoose.Types.ObjectId => The id of the landlord to fetch 
   */
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

  /**
   * createLandlord()
   * @desc Create a landlord object with the given first_name, last_name, email, and
   * password (the minimum required for a landlord account)
   * 
   * @param new_landlord
   *          first_name: string | null => the first name of the new landlord
   *          last_name: string | null => the last name of the new landlord
   *          email: string | null => the email of the new landlord
   *          password: string | null => the password of the new landlord
   */
  @Mutation(() => LandlordAPIResponse)
  async createLandlord(@Arg("new_landlord"){first_name, last_name, email, password}: LandlordInput) {
    console.log(chalk.bgBlue(`👉 createLandlord()`))

    if (!first_name || !last_name || !email || !password) {
      console.log(chalk.bgRed(`❌ Error: Insufficient fields`))
      return {success: false, error: "Insufficient fields."}
    }

    let landlord: DocumentType<Landlord> | null = await LandlordModel.findOne({ email })
    if (landlord != null) {
      console.log(chalk.bgRed(`❌ Error: User already exists with email ${email}`))
      return {success: false, error: "Landlord already exists"}
    }
    else {

      let hashed_password: string = bcrypt.hashSync(password, parseInt(process.env.SALT_ROUNDS as string))
      let new_landlord = new LandlordModel({
        first_name,
        last_name,
        email,
        password: hashed_password
      })

      let saved_landlord: DocumentType<Landlord> = await new_landlord.save() as DocumentType<Landlord>
      console.log(console.log(chalk.bgGreen(`✔ Successfully created a new landlord (${first_name} ${last_name})`)))
      return { success: true, data: saved_landlord }
    }

  }
}