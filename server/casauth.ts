import passport from 'passport'
import chalk from 'chalk'

import Student, {IStudentDoc} from './schemas/student.schema'

passport.serializeUser(function(user: any, done: Function) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
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
      done(null, new_student, { new: true })

    }
    else {
      
      done(null, student_doc, { new: false })
    }
  })

  done(null, {data: 123})
}));



//need to create api route for CAS login
import express from 'express'
const authRouter = express.Router()
authRouter.get("/cas-auth", (req, res, next) => {
  console.log(chalk.bgCyan(`👉 CAS Auth`))

  passport.authenticate('cas', (err, user, info) => {
    console.log(`err: ${err}`)
    console.log(`user: ${user}`)
    console.log(`info: ${info}`)

    return next({
      err,
      user,
      info
    })
  })(req, res, next)

  /*
  passport.authenticate('cas', function (err, user, info) {
    if (err) {
      return next(err);
    } else if (!user) {
      req.session.messages = info.message;
      if(process.env.NODE_ENV === "production") {
        //should be prod url but set to localhost for now
        return res.redirect(APIServerBaseURL);
      } else {
        //need to obtain front end server base url
        return res.redirect(FrontEndServerBaseURL);
      }
    } else {
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        } else {
          req.session.messages = '';
          //need to create function to generate session id
          let housingSID = generateSID()
          Promise.resolve(housingSID).then(resolvedSID => {
            if(resolvedSID != null) {
              //need user endpoint to update
              User.findOneAndUpdate({user_id: user.user_id},{connect_sid: resolvedSID},function(err,user) {
                if(err || user == null) {
                  return next(err);
                } else {
                  res.header("Set-Cookie","connect_sid="+resolvedSID)
                  if(process.env.NODE_ENV === "production") {
                    return res.redirect(APIServerBaseURL + '#/redirectCASLogin');
                  } else {
                    console.log("I entered here. using url", FrontEndServerBaseURL)
                    return res.redirect(`${FrontEndServerBaseURL}/#/redirectCASLogin`);
                  }
                }
              })
              return res.redirect(FrontEndServerBaseURL);
            }
          })
        }
      });
    }
  })(req, res, next);
  */

});

export default authRouter