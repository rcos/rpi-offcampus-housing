import express from 'express'
import chalk from 'chalk'
import Review, {IReviewDoc} from '../../schemas/review.schema'
import {validId} from '../../helpers'

const reviewRouter = express.Router();

reviewRouter.get('/:id', (req, res) => {

  /*
  GET /reviews/:id -> Retrieve the review document with the specified id, if it exists.
    Otherwise, prompt an error.
  */

  console.log(chalk.bgBlue(`👉 GET /api/reviews/:id`))
  let review_id = req.params.id;

  validId(review_id)
  .then(() => {

    Review.findById(review_id, (err: any, review_doc: IReviewDoc) => {

      // If an error occurred or the student does not exist, return an error
      if (err || !review_doc) {
        console.log(chalk.bgRed(`❌ Error: Could not find review with id: ${review_id}`))
        res.json({
          success: false,
          error: err ? err : `No review found.`
        })
      }

      // Otherwise, return the property_id, student_id, content, rating and term of the review
      else {

        console.log(chalk.bgGreen(`✔ Successfully found review with id ${review_id}`))
        res.json({
          success: true,
          review_data: review_doc.toObject()
        })

      }
    })

  })
  .catch(() => {
    console.log(chalk.bgRed(`❌ Error: ${review_id} is not a valid ObjectId.`))
    res.json({
      success: false,
      error: "Invalid id."
    })
  })

})

export default reviewRouter