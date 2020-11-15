import {Resolver, Mutation, Arg, Query} from 'type-graphql'
import {Student, StudentAPIResponse, StudentInput, StudentModel} from '../entities/Student'
import {DocumentType} from "@typegoose/typegoose"
import mongoose from 'mongoose'
import chalk from 'chalk'
const ObjectId = mongoose.Types.ObjectId

@Resolver()
export class StudentResolver {

  /**
   * getStudent (_id: mongoose.Types.ObjectId)
   * @desc Look for and return the student with the given id. If no student with that 
   *        id exists, return an error.
   * 
   * @param _id: mongoose.Types.ObjectId => The id of the student to retrieve
  */
  @Query(() => StudentAPIResponse, {nullable: false})
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

  /**
   * updateStudent ()
   * @desc Update the student information for the student with the provided id.
   *        If a parameter field is null, that field should be left unmodified.
   * 
   * @param _id: mongoose.Types.ObjectId => The id of the student to update
   * @param new_student
   *          first_name: string | null => The new value of the first_name for the student 
   *          last_name: string | null => The new value of the last_name for the student
   *          email: string | null => The new value of the email for the student
   */
  @Mutation(() => StudentAPIResponse)
  async updateStudent(@Arg("_id") _id: string, @Arg("new_student"){first_name, last_name, email}: StudentInput): Promise<StudentAPIResponse> {
    console.log(chalk.bgBlue(`👉 createStudent()`))

    let student_doc: DocumentType<Student> | null = await StudentModel.findById(_id)
    if (student_doc == null) {
      console.log(chalk.bgRed(`❌ Error: Attempting to update info for nonexisting user`))
      return { success: false, error: "Invalid user id." }
    }
    else {
      
      let updated: boolean = false
      if (first_name) {student_doc.first_name = first_name; updated = true;}
      if (last_name) {student_doc.last_name = last_name; updated = true;}
      if (email) {student_doc.email = email; updated = true;}

      console.log(chalk.bgGreen(`✔ Successfully updated student with id ${_id}`))
      if (updated) {
        let updated_student: DocumentType<Student> = await student_doc.save() as DocumentType<Student>
        return { success: true, data: updated_student }
      }
      else return { success: true, data: student_doc }

    }

  }
  
}