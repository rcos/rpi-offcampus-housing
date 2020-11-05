import express from 'express'
import chalk from 'chalk'
import Landlord, {ILandlordDoc} from '../../schemas/landlord.schema'
import _ from 'lodash'
import bcrypt from 'bcrypt'

const landlordRouter = express.Router();

landlordRouter.put('/', (req, res) => {
  
  /*
  PUT /landlords/ -> Create a new landlord with data from req.body
  */

  console.log(chalk.bgBlue(`👉 PUT /api/landlords/`))
  let landlord_ = req.body

  if (landlord_ == undefined) {
    console.log(chalk.bgRed(`❌ Error: No landlord data found`))
    res.json({
      success: false,
      error: "No landlord data found" 
    })
    return;
  }

  if (!_.has(landlord_, "first_name")) {
    console.log(chalk.bgRed(`❌ No first_name field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(landlord_, "last_name")) {
    console.log(chalk.bgRed(`❌ No last_name field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(landlord_, "email")) {
    console.log(chalk.bgRed(`❌ No email field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  if (!_.has(landlord_, "password")) {
    console.log(chalk.bgRed(`❌ No password field`))
    res.json({
      success: false,
      error: "Insufficient fields"
    })
    return;
  }

  Landlord.findOne({email: landlord_.email}, (err, landlord_doc) => {

    // if the student does not exist yet, create it.
    if (err || !landlord_doc) {

      // hash the password
      bcrypt.hash(landlord_.password, parseInt(process.env.SALT_ROUNDS as string), (bcrypt_err, hash: string) => {
        console.log(bcrypt_err)
        console.log(hash)
        if (bcrypt_err) {
          console.log(chalk.bgRed(`❌ Error occurred while hashing password.`))
          console.log(bcrypt_err)
          res.json({
            success: false,
            error: "Internal server error."
          })
        }
        else {

          // create the new landlord document
          let new_landlord = new Landlord({
            first_name: landlord_.first_name,
            last_name: landlord_.last_name,
            email: landlord_.email,
            password: hash
          });
        
          new_landlord.save((err: any, new_landlord_doc: ILandlordDoc) => {
            if (err) {
              console.log(chalk.bgRed(`❌ Problem saving landlord`))
              res.json({
                success: false,
                error: "Internal server error"
              })
            }
            else {
              console.log(chalk.bgGreen(`✔ Successfully created new user [first_name: ${new_landlord_doc.first_name}, last_name: ${new_landlord_doc.last_name}]`))
              res.json({
                success: true,
                landlord_info: {
                  _id: new_landlord_doc._id,
                  first_name: new_landlord_doc.first_name,
                  last_name: new_landlord_doc.last_name,
                  email: new_landlord_doc.email
                }
              })
            }
          })


        }
      })

    }

    // if the student already exists, return error
    else {
      console.log(chalk.bgRed(`❌ Error: landlord with email ${landlord_.email} already exists`))
      res.json({
        success: false,
        error: "Landlord already exists"
      })
    }
  })

})

export default landlordRouter