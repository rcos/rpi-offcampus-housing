import {Resolver, Mutation, Arg, Query, ObjectType, Field, ClassType} from 'type-graphql'
import {Student, StudentAPIResponse, StudentModel} from '../entities/Student'
import mongoose from "mongoose"
const ObjectId = mongoose.Types.ObjectId

@Resolver()
export class StudentResolver {

  @Query(() => [Student])
  async allStudents () {
    return await StudentModel.find ()
  }

  @Query(() => StudentAPIResponse, {nullable: true})
  async getStudent (@Arg("_id") _id: string): Promise<StudentAPIResponse> {
    if (!ObjectId.isValid(_id)) 
      return { success: false, error: "Invalid object id" }
    return { success: true, data: await StudentModel.findById(_id) }
  }
}