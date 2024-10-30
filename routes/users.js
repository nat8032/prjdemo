var express = require("express");
var router = express.Router();
var passport = require("passport");

var { connectDB, closeDB } = require("../config/database");
// 定義 Login API
router.get("/login", async (req, res) => {
  errorMessage = req.session.messages;
  res.render("login", { messages: errorMessage});
});

// 定義 checkLogin API
router.post(
  "/checkLogin",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login", failureMessage: true,
  })
);

router.get("/logout", (req, res) => {
  // API Path: /users/logout
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/register", function (req, res, next) {
  res.render("registerP");
});

router.post("/register", async (req, res, next) => {
  let db = await connectDB();

  try {
    let users = db.collection("user");
    const { uID, uName, password } = req.body;

    // JL added 2024-09-19 - Begin
    // Encrypt password using SHA256
    const crypto = require("crypto");
    const passwordHash = crypto
      .createHash("sha256")
      .update(Number(uID) + password)
      .digest("hex");
    console.log("passwordHash:", passwordHash);
    // JL added 2024-09-19 - End

    const oneUser = {
      uID: Number(uID),
      uName: uName,
      uLevel: 3,
      Mobile: Number(uID),
      Credit: 3,
      passwordHash: passwordHash,
    };

    // check if user already exists
    const userExists = await users.findOne({ uID: uID });
    if (userExists) {
      res.status(400).send("User already exists");
      console.log("User already exists");
      return;
    } else {
      try {
        await users.insertOne(oneUser);
        res.send(
          "<script>alert('User registered successfully'); window.location.href = '/users/login';</script>"
        );
      } catch (error) {
        res.send(
          "<script>alert('Error in inserting data'); history.back();</script>"
        );
        console.log(error);
      }
    }
  } finally {
    closeDB();
  } // end of try
});

module.exports = router;
