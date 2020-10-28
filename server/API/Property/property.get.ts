import express from 'express'
import chalk from 'chalk'
import Property, {IPropertyDoc} from '../../schemas/property.schema'
import Landlord, {ILandlordDoc} from '../../schemas/landlord.schema'
import Review, {IReviewDoc} from '../../schemas/review.schema'
import { validId } from '../../helpers';

const propertyRouter = express.Router();

propertyRouter.get('/:id/reviews', (req, res) => {
  console.log(chalk.bgBlue(`👉 GET /api/properties/:id/reviews`))
  let property_id = req.params.id;

  validId(property_id)
  .then(() => {

    Property.findById(property_id, (err: any, property_doc: IPropertyDoc) => {

      if (err || !property_doc) {
        console.log(chalk.bgRed(`❌ Error: Could not find property with id: ${property_id}`))
        res.json({
          success: false,
          error: err ? err : `No property found.`
        })
      }
      else {

        console.log(chalk.green(`✔ (1/2) Successfully found property with id ${property_id}`))
        
        let reviews = property_doc.reviews
        
        let reviews_promises = reviews.map(review_id => {
          return new Promise((resolve, reject) => {
            // look for the review document that matches the id review_id
            Review.findById(review_id, (err: any, review_doc: IReviewDoc) => {
              if (err || !review_doc) {
                resolve(null)
              }
              else {
                resolve(review_doc.toObject())
              }
            })
          })
        })

        // wait for all the reviews to finish
        Promise.all(reviews_promises)
        .then(fulfilled_reviews => {
          console.log(chalk.bgGreen(`✔ (2/2) Successfully retrieved all reviews for the property with id ${property_id}`))
          res.json({
            success: true,
            reviews: fulfilled_reviews
          })
        })
        .catch(() => {
          console.log(chalk.bgRed(`❌ (2/2) An error occurred retrieving all the reviews for the property with id ${property_id}`))
          res.json({
            success: false,
            error: "Internal server error"
          })
          return;
        })

      }

    })
    

  })
  .catch(() => {
    console.log(chalk.bgRed(`❌ Error: ${property_id} is not a valid ObjectId.`))
    res.json({
      success: false,
      error: "Invalid id."
    })
  })
})

propertyRouter.get('/:id/landlord', (req, res) => {
  console.log(chalk.bgBlue(`👉 GET /api/properties/:id/landlord`))
  let property_id = req.params.id;

  validId(property_id)
  .then(() => {

    Property.findById(property_id, (err: any, property_doc: IPropertyDoc) => {

      if (err || !property_doc) {
        console.log(chalk.bgRed(`❌ Error: Could not find property with id: ${property_id}`))
        res.json({
          success: false,
          error: err ? err : `No property found.`
        })
      }
      else {

        console.log(chalk.green(`✔ (1/2) Successfully found property with id ${property_id}`))
        
        let landlord_id = property_doc.landlord
        Landlord.findById(landlord_id, (err: any, landlord_doc: ILandlordDoc) => {

          // if we can't find the landlord, or if there is an error
          if (err || !landlord_doc) {
            console.log(chalk.bgRed(`❌ Error: No landlord with id ${landlord_id} found `))
            res.json({
              success: false,
              error: err ? err : `No landlord found`
            })
          }

          // if the landlord is found with no error
          else {
            console.log(chalk.bgGreen(`✔ (2/2) Successfully found the landlord that owns property with id ${property_id}`))
            res.json({
              success: true,
              first_name: landlord_doc.first_name,
              last_name: landlord_doc.last_name,
              _id: landlord_doc._id,
              email: landlord_doc.email,
              rating: landlord_doc.rating
            })
          }
        })

      }

    })
    

  })
  .catch(() => {
    console.log(chalk.bgRed(`❌ Error: ${property_id} is not a valid ObjectId.`))
    res.json({
      success: false,
      error: "Invalid id."
    })
  })
})

propertyRouter.get('/:id', (req, res) => {

  console.log(chalk.bgBlue(`👉 GET /api/properties/:id`))
  let property_id = req.params.id;

  validId(property_id)
  .then(() => {

    Property.findById(property_id, (err: any, property_doc: IPropertyDoc) => {

      if (err || !property_doc) {
        console.log(chalk.bgRed(`❌ Error: Could not find property with id: ${property_id}`))
        res.json({
          success: false,
          error: err ? err : `No property found.`
        })
      }
      else {

        console.log(chalk.bgGreen(`✔ Successfully found property with id ${property_id}`))
        res.json({
          success: true,
          property_data: {
            landlord: property_doc.landlord,
            location: property_doc.location,
            description: property_doc.description,
            reviews: property_doc.reviews,
            date_updated: property_doc.date_updated,
            period_available: property_doc.period_available,
            lease_duration: property_doc.lease_duration,
            price: property_doc.price,
            amenities: property_doc.amenities,
            sq_ft: property_doc.sq_ft
          }
        })

      }

    })
    

  })
  .catch(() => {
    console.log(chalk.bgRed(`❌ Error: ${property_id} is not a valid ObjectId.`))
    res.json({
      success: false,
      error: "Invalid id."
    })
  })

})

export default propertyRouter