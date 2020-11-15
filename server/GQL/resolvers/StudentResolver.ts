import {Resolver, Mutation, Arg, Query, ObjectType, Field, ClassType} from 'type-graphql'
import {Student, StudentAPIResponse, StudentModel} from '../entities/Student'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
const ObjectId = mongoose.Types.ObjectId

@Resolver()
export class StudentResolver {

  @Query(() => [Student])
  async allStudents () {
    return await StudentModel.find ()
  }

  @Query(() => StudentAPIResponse, {nullable: true})
  async getStudent (@Arg("_id") _id: string): Promise<StudentAPIResponse> {
    console.log(chalk.bgBlue(`👉 getStudent(id)`))

    if (!ObjectId.isValid(_id)) {
      console.log(chalk.bgRed(`❌ Error: ${_id} is not a valid student id.`))
      return { success: false, error: "Invalid object id" }
    }
    let student_doc: DocumentType<Student> | null = await StudentModel.findById(_id)
    if (student_doc == null) {
      console.log(chalk.bgRed(`❌ Error: No student with id ${_id} exists.`))
      return { success: false, error: "No user found" }
    }
    else {
      console.log(chalk.bgGreen(`✔ Successfully found student with id ${_id}`))
      return { success: true, data: await StudentModel.findById(_id) }
    }
  }
}