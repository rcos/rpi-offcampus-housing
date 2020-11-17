import {Resolver, Mutation, Arg, Query} from 'type-graphql'
import {Institution, 
  InstitutionList,
  InstitutionListAPIResponse,
  InstitutionAPIResponse, 
  InstitutionModel} from '../entities/Institution'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
import bcrypt from 'bcrypt'
const ObjectId = mongoose.Types.ObjectId

@Resolver()
export class InstitutionResolver {

  @Query(() => InstitutionListAPIResponse)
  async getMatchingInstitutions(@Arg("partial_name") partial_name: string): Promise<InstitutionListAPIResponse>
  {

    console.log(chalk.bgBlue(`👉 getMatchingInstitutions(partial_name)`))
    let institutions: DocumentType<Institution>[] = await InstitutionModel.find({
      "name": { "$regex": partial_name, "$options": "i" }
    })

    console.log(chalk.bgGreen(`Found ${institutions.length} institutions matching ${partial_name}`))
    return {
      data: {
        institutions
      },
      success: true
    }

  }
}