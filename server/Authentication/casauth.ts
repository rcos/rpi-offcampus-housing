import passport from 'passport'
import chalk from 'chalk'

import Student, {IStudentDoc} from '../schemas/student.schema'

passport.serializeUser(function(user: any, done: Function) {
  done(null, user);
});
passport.deserializeUser(function(user: any, done: Function) {

  console.log(`Deserialize`)
  console.log(user)
  // try to find the user in student
  Student.findById(user._id, (err: any, student_doc: IStudentDoc) => {
    if (!err && student_doc) done(null, student_doc)
    else if (err) done(err, null)
    
    // student doesnt exsit
    // else
  })

  // TODO try to find the user in landlord
});
//IF PROD
passport.use(
  new (require('passport-cas').Strategy)
({
  version: 'CAS3.0',
  ssoBaseURL: 'https://cas-auth.rpi.edu/cas',
  serverBaseURL: 'http://localhost:9010'
}, 

function(profile: any, done: Function) {

  console.log(chalk.cyan('👉 In Passport Authenticate'))
  let cas_id = profile.user
  console.log(`CAS ID: ${cas_id}`)

  // if the user exists, log the user in
  // otherwise, sign them up
  Student.findOne({
    'auth_info.cas_id': cas_id
  }, async (err: any, student_doc: IStudentDoc) => {
    if (err) {

      // send an error if a problem occurred
      console.log(chalk.bgRed(`Error looking for student where auth_info.cas_id = ${cas_id}`))
      done(err)
    }
    else if (!student_doc) {

      // register the user if they do not exist
      console.log(chalk.blue(`User with auth_info.cas_id = ${cas_id} could not be found. Registering user.`))

      let new_student: IStudentDoc = new Student({
        auth_info: { cas_id }
      })

      let saved_user = await new_student.save()
      done(null, new_student.toObject(), { new: true })

    }
    else {
      
      done(null, student_doc.toObject(), { new: false })
    }
  })
}));

//need to create api route for CAS login
import express from 'express'
const authRouter = express.Router()
authRouter.get("/cas-auth", (req, res, next) => {
  console.log(chalk.bgCyan(`👉 CAS Auth`))

  res.header('Access-Control-Allow-Credentials', "true");
  passport.authenticate('cas', (err, user, info) => {

    if (err) return next(err);
    else {
      req.logIn(user, (login_err) => {

        if (login_err) return next(login_err);
        else if (info.new) res.redirect('http://localhost:3000/student/register/complete')
        else res.redirect('http://localhost:3000/')

      })
    }
  })(req, res, next)

});

authRouter.get("/user", (req, res) => {
  res.json({
    user: req.user,
    authenticated: req.isAuthenticated()
  })
})



export default authRouter