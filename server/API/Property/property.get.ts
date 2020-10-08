import express from 'express'
import chalk from 'chalk'
import Property, {IPropertyDoc} from '../../schemas/property.schema'
import { validId } from '../../helpers';

const propertyRouter = express.Router();

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