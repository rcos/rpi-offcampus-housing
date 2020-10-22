const passport = require('passport')
const APIServerBaseURL = 'http://localhost:3000'


passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
if(process.env.NODE_ENV === "production") {
  passport.use(new (require('passport-cas').Strategy)({
    version: 'CAS3.0',
    ssoBaseURL: 'https://cas-auth.rpi.edu/cas',
    serverBaseURL: 'http://localhost:3000'
  }, function(profile, done) {
    var login = profile.user.toLowerCase();
    User.findOne({user_id: login}, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message: 'Unknown user'});
      }
      user.attributes = profile.attributes;
      return done(null, user);
    });
  }));
} else {
  passport.use(new (require('passport-cas').Strategy)({
    version: 'CAS3.0',
    ssoBaseURL: 'https://cas-auth.rpi.edu/cas',
    serverBaseURL: APIServerBaseURL
  }, function(profile, done) {
    var login = profile.user.toLowerCase();
    User.findOne({user_id: login}, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message: 'Unknown user'});
      }
      user.attributes = profile.attributes;
      return done(null, user);
    });
  }));
}



authRoutes.get("/loginCAS", (req, res, next) => {
  passport.authenticate('cas', function (err, user, info) {
    if (err) {
      return next(err);
    } else if (!user) {
      req.session.messages = info.message;
      if(process.env.NODE_ENV === "production") {
        //should be prod url but set to localhost for now
        return res.redirect(APIServerBaseURL);
      } else {
        return res.redirect(FrontEndServerBaseURL());
      }
    } else {
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        } else {
          req.session.messages = '';
          //need to created function to generate session id
          let housingSID = generateSID()
          Promise.resolve(housingSID).then(resolvedSID => {
            if(resolvedSID != null) {
              User.findOneAndUpdate({user_id: user.user_id},{connect_sid: resolvedSID},function(err,user) {
                if(err || user == null) {
                  return next(err);
                } else {
                  res.header("Set-Cookie","connect_sid="+resolvedSID)
                  if(process.env.NODE_ENV === "production") {
                    return res.redirect(APIServerBaseURL + '#/redirectCASLogin');
                  } else {
                    console.log("I entered here. using url", FrontEndServerBaseURL())
                    return res.redirect(`${FrontEndServerBaseURL()}/#/redirectCASLogin`);
                  }
                }
              })
              return res.redirect(FrontEndServerBaseURL());
            }
          })
        }
      });
    }
  })(req, res, next);
});