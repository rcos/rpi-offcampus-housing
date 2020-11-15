import {Resolver, Mutation, Arg, Query} from 'type-graphql'
import {Student, StudentModel} from '../entities/Student'

@Resolver()
export class StudentResolver {

  @Query(() => [Student])
  async allStudents () {
    return await StudentModel.find ()
  }
}