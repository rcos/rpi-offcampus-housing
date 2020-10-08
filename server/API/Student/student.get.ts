import express from 'express'
import chalk from 'chalk'
import Student, {IStudentDoc} from '../../schemas/student.schema'

const studentRouter = express.Router();

studentRouter.get('/:id', (req, res) => {

  console.log(chalk.bgBlue(`👉 GET student/:id`))
  let student_id = req.params.id;

  validId(student_id)
  .then(() => {

    Student.findById(student_id, (err: any, student_doc: IStudentDoc) => {

      // If an error occurred or the student does not exist, return an error
      if (err || !student_doc) {
        console.log(chalk.bgRed(`❌ Error: Could not find student with id: ${student_id}`))
        res.json({
          success: false,
          error: err ? err : `No student found.`
        })
      }

      // Otherwise, return the _id, first_name, last_name and email of the student
      else {

        console.log(chalk.bgGreen(`✔ Successfully found student with id ${student_id}`))
        res.json({
          success: true,
          first_name: student_doc.first_name,
          last_name: student_doc.last_name,
          email: student_doc.email,
          _id: student_doc._id
        })

      }
    })

  })
  .catch(() => {
    console.log(chalk.bgRed(`❌ Error: ${student_id} is not a valid ObjectId.`))
    res.json({
      success: false,
      error: "Invalid id."
    })
  })
  

})

import mongoose from 'mongoose'
const validId = (id: string): Promise<null> => {

  return new Promise<null>((resolve, reject) => {
    if (mongoose.Types.ObjectId.isValid(id)) resolve()
    else reject()
  });

}

export default studentRouter