import passport from 'passport'
import chalk from 'chalk'
import {StudentModel, Student} from '../GQL/entities/Student'
import {Institution, InstitutionModel} from '../GQL/entities/Institution'
import {LandlordModel} from '../GQL/entities/Landlord'
import {DocumentType} from "@typegoose/typegoose"

passport.serializeUser(function(user: any, done: Function) {
  done(null, user);
});
passport.deserializeUser(function(user: any, done: Function) {

  console.log(`Deserialize`)
  console.log(user)
  // try to find the user in student
  StudentModel.findById(user._id, (err: any, student_doc: DocumentType<Student>) => {
    if (!err && student_doc) done(null, {...student_doc.toObject(), type: 'student'})
    else if (err) done(err, null)
    
    // student doesnt exsit
    else {
      LandlordModel.findById(user._id, (err: any, landlord_doc) => {
        if (!err && landlord_doc) done (null, {...landlord_doc.toObject(), type: 'landlord'})
        else if (err) done(err, null)
        else done(null, false)
      })
    }
  })

  // TODO try to find the user in landlord
});
//IF PROD
passport.use(
  new (require('passport-cas').Strategy)
({
  version: 'CAS3.0',
  ssoBaseURL: 'https://cas-auth.rpi.edu/cas',
  serverBaseURL: `http://localhost:9010`
}, 

function(profile: any, done: Function) {

  console.log(chalk.cyan('👉 In Passport Authenticate'))
  let cas_id = profile.user
  console.log(`CAS ID: ${cas_id}`)

  // if the user exists, log the user in
  // otherwise, sign them up
  StudentModel.findOne({
    'auth_info.cas_id': cas_id
  }, (err: any, student_doc: DocumentType<Student>) => {
    if (err) {

      // send an error if a problem occurred
      console.log(chalk.bgRed(`Error looking for student where auth_info.cas_id = ${cas_id}`))
      done(err)
    }
    else {
      let instution_name = 'Rensselaer Polytechnic Institute'
      InstitutionModel.findOne({name: instution_name}, async (err, institution_doc: DocumentType<Institution>) => {
        if (err) {
          console.log(chalk.bgRed(`Error looking for institution where name = ${instution_name}`))
          done(err)
        }
        else if (!institution_doc) {
          console.log(chalk.bgRed(`No institution found with name = ${instution_name}`))
          done("Invalid institution")
        }
        else {

          if (!student_doc) {
            // register the user if they do not exist
            console.log(chalk.blue(`User with auth_info.cas_id = ${cas_id} could not be found. Registering user.`))
      
            let new_student: DocumentType<Student> = new StudentModel({
              saved_collection: [],
              user_settings: {
                recieve_email_notifications: true,
                push_subscriptions: []
              },
              auth_info: {
                cas_id: cas_id,
                institution_id: institution_doc._id,
              }
            })

            let added_student = await new_student.save()
            done(null, added_student.toObject(), { new: true })
      
          }
          else {
            
            done(null, student_doc.toObject(), { new: false })
          }

        }
      })
    }
  })
}));

//need to create api route for CAS login
import express from 'express'
import {frontendPath} from '../config'
const authRouter = express.Router()
authRouter.get("/rpi/cas-auth", (req, res, next) => {
  console.log(chalk.bgCyan(`👉 CAS Auth`))

  res.header('Access-Control-Allow-Credentials', "true");
  passport.authenticate('cas', (err, user, info) => {

    if (err) {
      console.log(`An error occurred ...`)
      console.log(err);
      res.redirect(`html://${process.env.FRONTEND_IP}:3000/student/login?err=Server+Error`)
    }
    else {
      req.logIn(user, (login_err) => {

        if (login_err) return next(login_err);
        else if (info.new) res.redirect(`http://${process.env.FRONTEND_IP}:3000/student/register/complete`)
        else res.redirect(`http://localhost:3000/`)

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

authRouter.get('/logout', function(req, res){
  req.logout();

  res.header('Access-Control-Allow-Credentials', "true");
  res.header('Access-Control-Allow-Origin', frontendPath(null));
  res.json({
    success: true
  })
});



export default authRouter