import express from 'express'
import chalk from 'chalk'
import Student, {IStudentDoc} from '../../schemas/student.schema'
import _, { update } from 'lodash'

const studentRouter = express.Router();

studentRouter.put('/', (req, res) => {
  
  /*
  PUT /students -> Create a new student with data from req.body
  */

  console.log(chalk.bgBlue(`👉 PUT /api/students/`))
  let student_ = req.body

  if (student_ == undefined) {
    console.log(chalk.bgRed(`❌ Error: No student data found`))
    res.json({
      success: false,
      error: "No student data found" 
    })
    return;
  }

  if (!_.has(student_, "first_name")) {
    console.log(chalk.bgRed(`❌ No first_name field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(student_, "last_name")) {
    console.log(chalk.bgRed(`❌ No last_name field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(student_, "email")) {
    console.log(chalk.bgRed(`❌ No email field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  Student.findOne({email: student_.email}, (err, student_doc) => {

    // if the student does not exist yet, create it.
    if (err || !student_doc) {

      let new_student = new Student({
        first_name: student_.first_name,
        last_name: student_.last_name,
        email: student_.email
      });
    
      new_student.save((err: any, new_student_doc: IStudentDoc) => {
        if (err) {
          console.log(chalk.bgRed(`❌ Problem saving student`))
          res.json({
            success: false,
            error: "Internal server error"
          })
        }
        else {
          console.log(chalk.bgGreen(`✔ Successfully created new user [first_name: ${new_student_doc.first_name}, last_name: ${new_student_doc.last_name}]`))
          res.json({
            success: true,
            _id: new_student_doc._id,
            first_name: new_student_doc.first_name,
            last_name: new_student_doc.last_name,
            email: new_student_doc.email
          })
        }
      })

    }

    // if the student already exists, return error
    else {
      console.log(chalk.bgRed(`❌ Error: student with email ${student_.email} already exists`))
      res.json({
        success: false,
        error: "Student already exists"
      })
    }
  })

})

studentRouter.put('/:id/', (req, res) => {

  /*
  Update the document information for the user with the specified id
  */
 let user_id = req.params.id
 console.log(chalk.bgBlue(`👉 PUT /api/students/:id`))

 let updated_info = req.body
 Student.findById(user_id, async (err: any, student_doc: IStudentDoc) => {
   if (err) {
     console.log(chalk.bgRed(`❌ Error occurred looking for student with id ${user_id}`))
     res.json({
       success: false,
       error: "Internal serfver error"
     })
   }

   else if (!student_doc) {
     console.log(chalk.bgRed(`❌ Error: Attempting to update info for nonexisting user`))
     res.json({
       success: false,
       error: "Invalid user id"
     })
   }

   else {
     // update the fields
     if (_.has(updated_info, "first_name")) student_doc.first_name = updated_info.first_name
     if (_.has(updated_info, "last_name")) student_doc.last_name = updated_info.last_name
     if (_.has(updated_info, "email")) student_doc.email = updated_info.email

     let updated_student_doc = await student_doc.save()

     res.json({
       success: true,
       updated_student: updated_student_doc.toObject()
     })
   }
 })

})

export default studentRouter