import {Resolver, Mutation, Arg, Query} from 'type-graphql'
import {Landlord, LandlordAPIResponse, LandlordInput, LandlordModel} from '../entities/Landlord'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
import bcrypt from 'bcrypt'
const ObjectId = mongoose.Types.ObjectId
import SendGrid, {SendGridTemplate} from '../../vendors/SendGrid'
import {frontendPath} from '../../config'

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

      let confirm_key: string =  generateConfirmKey ()
      let hashed_password: string = bcrypt.hashSync(password, parseInt(process.env.SALT_ROUNDS as string))
      let new_landlord = new LandlordModel({
        first_name,
        last_name,
        email,
        password: hashed_password,
        confirmation_key: confirm_key
      })

      // Email
      SendGrid.sendMail({
        to: email,
        email_template_id: SendGridTemplate.LANDLORD_EMAIL_CONFIRMATION,
        template_params: {
          confirmation_key: confirm_key,
          frontend_url: frontendPath()
        }
      })

      let saved_landlord: DocumentType<Landlord> = await new_landlord.save() as DocumentType<Landlord>
      console.log(console.log(chalk.bgGreen(`✔ Successfully created a new landlord (${first_name} ${last_name})`)))
      return { success: true, data: saved_landlord }
    }

  }

  @Mutation(() => LandlordAPIResponse)
  async updatePhoneNumber(
    @Arg("landlord_id") landlord_id: string,
    @Arg("phone_number") phone_number: string
  ): Promise<LandlordAPIResponse>
  {

    console.log(chalk.bgBlue(`👉 updatePhoneNumber()`))
    if (!ObjectId.isValid(landlord_id)) {
      console.log(chalk.bgRed(`❌ Error: Landlord id ${landlord_id} is not a valid object id`))
      return {
        success: false,
        error: "Invalid landlord id"
      }
    }
    let landlord_: DocumentType<Landlord> = await LandlordModel.findById(landlord_id) as DocumentType<Landlord>
    landlord_.phone_number = phone_number

    let updated_landlord: DocumentType<Landlord> = await landlord_.save() as DocumentType<Landlord>
    
    console.log(chalk.bgGreen(`✔ Successfully updated phone number!`))
    return {
      success: true,
      data: updated_landlord
    }

  }
}


const generateConfirmKey = (): string => {
  let capitals = [65, 91];
  let lowercases = [97, 123];

  let key_ = ""
  for (let i = 0; i < 120; ++i) {
    let r_ = Math.random();
    if (r_ < 0.33) {
      key_ += String.fromCharCode( Math.floor(( (capitals[1] - capitals[0]) * Math.random() ) + capitals[0] ) );
    }
    else if (r_ < 0.66) {
      key_ += String.fromCharCode( Math.floor(( (lowercases[1] - lowercases[0]) * Math.random() ) + lowercases[0] ) );
    }
    else key_ += Math.floor(Math.random() * 10).toString()
  }
  return key_
}