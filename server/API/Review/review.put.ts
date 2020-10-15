import express from 'express'
import chalk from 'chalk'
import mongoose from 'mongoose'
import Review, {IReviewDoc} from '../../schemas/review.schema'
import {validId} from '../../helpers'
import _ from 'lodash'

const reviewRouter = express.Router();

reviewRouter.put('/', async (req, res) => {

  /*
  PUT /reviews/ -> Create a new review with data from req.body
  */

  console.log(chalk.bgBlue(`👉 PUT /api/reviews/`))
  let review_ = req.body

  if (review_ == undefined) {
    console.log(chalk.bgRed(`❌ Error: No review data found`))
    res.json({
      success: false,
      error: "No review data found" 
    })
    return;
  }

  // validate fields
  if (!_.has(review_, "content")) {
    console.log(chalk.bgRed(`❌ No content field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(review_, "property_id")) {
    console.log(chalk.bgRed(`❌ No property_id field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(review_, "student_id")) {
    console.log(chalk.bgRed(`❌ No student_id field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!mongoose.Types.ObjectId.isValid( review_.student_id )) {
    console.log(chalk.bgRed(`❌ student_id is not a valid ObjectId`))
    res.json({
      success: false,
      error: "Malformed data"
    })
    return;
  }

  if (!mongoose.Types.ObjectId.isValid( review_.property_id )) {
    console.log(chalk.bgRed(`❌ property_id is not a valid ObjectId`))
    res.json({
      success: false,
      error: "Malformed data"
    })
    return;
  }

  let new_review = new Review({
    property_id: review_.property_id,
    student_id: review_.student_id,
    content: review_.content
  });

  new_review.save((err: any, new_review_doc: IReviewDoc) => {
    if (err) {
      console.log(chalk.bgRed(`❌ Problem saving review`))
      res.json({
        success: false,
        error: "Internal server error"
      })
    }
    else {
      console.log(chalk.bgGreen(`✔ Successfully created new review [student_id: ${new_review_doc.student_id}, property_id: ${new_review_doc.property_id}]`))
      res.json({
        success: true,
        _id: new_review_doc._id,
        student_id: new_review_doc.student_id,
        property_id: new_review_doc.property_id,
        content: new_review_doc.content
      })
    }
  })

})

export default reviewRouter