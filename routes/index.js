var express = require('express');
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res) {
  let user = { uName: "" };
  if (req.isAuthenticated()) user = req.session.passport.user;

  res.render("index", { title: "ERB Hobby Workshop", user: user });
});


module.exports = router;
