import passport from 'passport'
import chalk from 'chalk'
// import Landlord from '../schemas/landlord.schema'
import {LandlordModel, Landlord} from '../GQL/entities/Landlord'
import {DocumentType} from "@typegoose/typegoose"
import bcrypt from 'bcrypt'

/*
Local strategy is used for landlords who want to
log into the application.
*/
passport.use(new (require('passport-local').Strategy)(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  (email: string, password: string, done: Function) => {

    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)

    LandlordModel.findOne({email: email}, (err, landlord_doc: DocumentType<Landlord>) => {

      if (err) {
        console.log(chalk.bgRed(`❌ Error finding landlord`))
        console.log(err)
        return done(err)
      }
      else if (!landlord_doc) {
        console.log(chalk.bgRed(`❌ Landlord does not exist`))
        return done(null, false)
      }
      else {
        // verify password
        bcrypt.compare(password, landlord_doc.password ? landlord_doc.password : '', (bcrypt_err, result: boolean) => {

          console.log(`Passwords match? ${result}`)

          if (bcrypt_err) return done(bcrypt_err)
          if (!result) return done(null, false)
          else return done(null, landlord_doc)

        })
      }

    })

  }
));

import express from 'express'
const authRouter = express.Router ()
authRouter.post("/local-auth", (req, res, next) => {

  console.log(chalk.bgCyan("👉 Local Auth"))
  next()
},
passport.authenticate('local'),
(req, res) => {
  
  console.log(`User:`)
  console.log(req.user)

  res.json({
    success: true
  })

})

export default authRouter