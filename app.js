var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// JL added 2024-09-19 - Begin
var session = require("express-session");
var passport = require("passport");
var Strategy = require("passport-local").Strategy;
var { connectDB, closeDB } = require("./config/database");
// JL added 2024-09-19 - End

var app = express();

// JL added 2024-09-19 - begin
app.use(
  session({
    secret: "CLASSROOMSECRET",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// JL added 2024-09-19 - end

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var classesRouter = require('./routes/classes');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/classes', classesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// JL added 2024-09-19 - begin
passport.use(
  new Strategy(
    {
      // consumerKey: TWITTER_CONSUMER_KEY,
      // consumerSecret: TWITTER_CONSUMER_SECRET,
      // callbackURL: "http://www.example.com/auth/twitter/callback",
      passReqToCallback: true
    },
  async function (req, username, password, cb) {
      let db = await connectDB();
    try {
      let users = db.collection("user");
      let user = await users.findOne({ uID: Number(username) });
      console.log(username);
      console.log(password);
      console.log(user);

      if (!user) { // user not found
        if (req.session) req.session.messages = [];
        return cb(null, false, { message: 'user not found'});
      } else {
        // Encrypt the provided password using SHA256
        const crypto = require("crypto");
        const passwordHash = crypto
          .createHash("sha256")
          .update(Number(username) + password)
          .digest("hex");
        console.log(passwordHash);
        console.log(user.passwordHash);
        if (user.passwordHash !== passwordHash) {
          // password not match
          console.log("passport not match");
          if (req.session) req.session.messages = [];
          return cb(null, false, { message: 'Incorrect username or password.'});
        }
        else { // user and password match     
          return cb(null, user);
        }
      }
      // } catch (err) {
      //   return cb(err);
    } finally {
      closeDB();
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});
// JL added 2024-09-19 - end

module.exports = app;
