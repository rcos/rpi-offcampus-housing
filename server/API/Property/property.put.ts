import express from 'express'
import chalk from 'chalk'
import Property, {IPropertyDoc} from '../../schemas/property.schema'
import _ from 'lodash'
import mongoose from 'mongoose'

const propertyRouter = express.Router();

propertyRouter.put('/', (req, res) => {

  console.log(chalk.bgBlue(`👉 PUT /api/properties/`))
  let property_ = req.body

  if (property_ == undefined) {
    console.log(chalk.bgRed(`❌ Error: No property data found`))
    res.json({
      success: false,
      error: "No property data found"
    })
    return;
  }

  // validate required fields
  if (!_.has(property_, 'landlord')) {
    console.log(chalk.bgRed(`❌ No landlord field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(property_, 'location')) {
    console.log(chalk.bgRed(`❌ No location field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(property_, 'description')) {
    console.log(chalk.bgRed(`❌ No description field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(property_, 'price')) {
    console.log(chalk.bgRed(`❌ No price field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  // validate objectid
  if (!mongoose.Types.ObjectId.isValid(property_.landlord)) {
    console.log(chalk.bgRed(`❌ Landlord ID is invalid`))
    res.json({
      success: false,
      error: "Invalid landlord id"
    })
    return;
  }

  // TODO check to make sure landlord id exists in database

  // create the new property
  let new_property = new Property(property_)
  new_property.save((err: any, new_property_doc: IPropertyDoc) => {
    if (err) {
      console.log(chalk.bgRed(`❌ Problem saving property`))
      console.log(err)
      res.json({
        success: false,
        error: "Internal server error"
      })
    }
    else {
      console.log(chalk.bgGreen(`✔ Successfully created new property (id: ${new_property_doc._id})`))
      res.json({
        success: true,
        ...new_property_doc.toObject()
      })
    }
  })

})

export default propertyRouter