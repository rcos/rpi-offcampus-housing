import passport from 'passport'
import chalk from 'chalk'
import Landlord from '../schemas/landlord.schema'
import bcrypt from 'bcrypt'

/*
Local strategy is used for landlords who want to
log into the application.
*/
passport.use(new (require('passport-local'))(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  (email: string, password: string, done: Function) => {

    Landlord.findOne({email: email}, (err, landlord_doc) => {

      if (err) return done(err)
      else if (!landlord_doc) return done(null, false)
      else {
        // verify password
        bcrypt.compare(password, landlord_doc.password, (bcrypt_err, result: boolean) => {

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
authRouter.get("local-auth", (req, res, next) => {

  console.log(chalk.bgCyan("👉 Local Auth"))

  res.header('Access-Control-Allow-Credentials', "true");
  passport.authenticate('local', {failureRedirect: 'http://localhost:3000/landlord/login'}, (_, res) => {
    res.redirect('http://localhost:3000/')
  })

})

export default authRouter