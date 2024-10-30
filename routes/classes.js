var express = require('express');
var router = express.Router();
var path = require("path");
var { connectDB, closeDB } = require('../config/database');
var htmlTitle = "ERB Hobby Workshop";

/* GET; leave for functional demonstration */
router.get('/', async function(req, res, next) {
  req.session.messages = "";
  let user = { uName: "" };
  if (req.isAuthenticated()) user = req.session.passport.user;

  let category = "";
  res.render("classCategories", { title: "ERB Hobby Workshop",user: user, category});
});

router.get('/classCategories/:classType', async function(req, res, next) {
  let user = { uName: "" }; // no user login required for browsing classes
  if (req.isAuthenticated()) user = req.session.passport.user;

  let category = req.params.classType;
  res.render("classCategories", { title: "ERB Hobby Workshop",user: user, category});
});

router.get('/getClassDetails/:classID', async function (req, res, next) {
  // get class details by classID
    try {
      // let uid = req.sessionID("UID");
      let uid = 99900000;
      console.log("[info] classID:", req.params.classID);

      const db = await connectDB();
      const cUser = db.collection("user");
      const joinClassScheduleLocTutor = db.collection("joinClassScheduleLocTutor");
      const dUser = await cUser.find({ uID: uid }).toArray();
      const data = await joinClassScheduleLocTutor.find({ classID: Number(req.params.classID) }).toArray();

      // console.log("data[0].classCredit:", data[0].classCredit);
      // console.log("dUser[0].Credit:", dUser[0].Credit);

      // counting with user remain credit if register selected class
      let remainCredit = dUser[0].Credit - data[0].classCredit;
      console.log("[info] UID: [", uid, "]; check if register classID: [", req.params.classID, "], then remainCredit: [", remainCredit, "]");
      // if (remainCredit < 0) {
      //   res.send("Not enough credit");
      // } else res.send("Go ahead!");

      res.render("regClass", { regClass: data, remainCredit: remainCredit });
    } finally {
      await closeDB();
  } 
});

router.get('/getRegClass', async function (req, res, next) {
  // get registered class by user ID (uID)   
  if (req.isAuthenticated()) {
    let user = req.session.passport.user;
      
    try {      
      const db = await connectDB();
      const joinUserClassDetails = db.collection("joinUserClassDetails");
      const data = await joinUserClassDetails.find({ uID: user.uID }).sort({ classSchedule: 1, classID: 1 }).toArray();
      const colUser = db.collection("user");
      const dataUser = await colUser.find({ uID: user.uID }).toArray();
      const userCredit = Number(dataUser[0].Credit);

      let regCount = data.length;
      console.log("[info] number if registered class ( for UID:", user.uID, "):", regCount);

      let msgInfo = "";
      if (regCount > 0) msgInfo = "[ 你現有 Credit (" + userCredit + "); 已登記報讀課程數量: " + regCount + " ]";
      else msgInfo = "[ 你現有 Credit (" + userCredit + "); 並無登記報讀課程紀錄 ]";

      // render data to regClassList.ejs
      res.render("regClassList", { title: htmlTitle, user: user, regClass: data, msg: msgInfo }); 
    } finally {
      await closeDB();
    }; 
  } else res.redirect("/");
});

router.get('/regClass/:classID', async function (req, res, next) {
  // register class by class ID (classID)
  if (req.isAuthenticated()) {
    let user = req.session.passport.user;

  let classID = Number(req.params.classID);
  try {  
    const db = await connectDB();
    const joinClassScheduleLocStateTutor = db.collection("joinClassScheduleLocStateTutor");
      const coUserClass = db.collection("userClass");
      const colUser = db.collection("user");
    const data = await joinClassScheduleLocStateTutor.find({ classID: classID }).toArray();
      const dataUserClass = await coUserClass.find({ classID: classID }).toArray();
      const dataUser = await colUser.find({ uID: user.uID }).toArray();
      const remainSeat = Number(data[0].maxSeat) - dataUserClass.length;
      const userCredit = Number(dataUser[0].Credit);

      console.log("[info] request for class registration with classID:", classID);

    let msgInfo = "";
      let validRegClass = true;     // preset flag for class registration

      // check if user already register selected class
      dataUserClass.forEach((Element) => {
        if ( user.uID == Element.uID ) {
          console.log("[info] user already register with classID:", classID);
          validRegClass = false;
          msgInfo = "[ 你現有 Credit (" + userCredit + "); 你之前已經報讀此課程 ]";  
        };
      });

      // check if class registration is full; i.e. no remain seat
      if (validRegClass === true) {
        if ( remainSeat > 0 ) {
      console.log("[info] Remain seat for registration: " + remainSeat);
          msgInfo = "[ 你現有 Credit (" + userCredit + "); 課程尚餘報讀名額: " + remainSeat + " ]";
        } else {
          console.log("[info] registered class is full:", classID);
      validRegClass = false;
          msgInfo = "[ 你現有 Credit (" + userCredit + "); 此課程報讀名額已滿 ]";
        }
    };

      // check if time of class schedule is up
    let cuDate = new Date();
      let classDate = new Date( data[0].classSchedule );
      if ((validRegClass === true) && ( cuDate > classDate )) {
        console.log("[info] book schedule time is up; current date:", cuDate, ", class schedule date:", classDate);
      validRegClass = false;
        msgInfo = "[ 你現有 Credit (" + userCredit + "); 此課程報名時間已過 ]";
    };

      // check if class is open for registration
      if ((validRegClass === true) && ( Number(data[0].stateID ) > 1)) {
      console.log(data);
        console.log("[info] class is not open for registration; stateID:", data[0].stateID, " ,", data[0].stateDetails);
      validRegClass = false;
        msgInfo = "[ 你現有 Credit (" + userCredit + "); 此課程暫不接受報名: " + data[0].stateDetails + " ]";      
     };

      // check if user with enought credit
      if ((validRegClass === true) && ( data[0].classCredit > dataUser.Credit )) {
        console.log("[info] user credit: ", dataUser.Credit);
        validRegClass = false;
        msgInfo = "[ 你現有 Credit (" + userCredit + "); 沒有足夠Credit報讀此課堂 ]";      
      };

      res.render("regClass", { title: htmlTitle, user: user, msg: msgInfo, regClass: data, classID: classID, remainSeat: remainSeat, validRegClass: validRegClass }); 
  } finally { 
    await closeDB();
    };
  } else res.redirect("/");    
});

router.post('/confirmRegClass', async function (req, res, next) {
  // confirm register class by class ID (classID)
  if (req.isAuthenticated()) {
    let user = req.session.passport.user;
    let uID = user.uID;
    let classID = Number(req.body.classID);

    try {  
      const db = await connectDB();

      // update user remaining (decrease) credit with reference to class credit request
      const colUser = db.collection("user");
      const colClass = db.collection("class");
      const dataUser = await colUser.find({ uID: uID }).toArray();
      const dataClass = await colClass.find({ classID: classID }).toArray();

      let remainCredit = Number(dataUser[0].Credit) - Number(dataClass[0].classCredit);
      console.log("user credit update after class registration:", remainCredit);
      await colUser.updateOne(
        { uID: uID }, 
        { $set: { Credit: remainCredit }}
      );

      // update user class registration
      const colUserClass = db.collection("userClass");
      await colUserClass.insertOne({
        uID: uID,                               // user ID
        classID: Number(classID),               // classID
        applyDate: new Date()                   // apply date; as current date
      });
      res.json({ result: true, msg: "所選課程成功登記完成" });
    } catch(err) {
      res.json({ result: false, msg: "[ 登記課程發生錯誤: " + err + " ]"});         
    } finally { 
      await closeDB();
    };
  } else res.redirect("/");     
});

router.post('/cancelRegClass', async function (req, res, next) {
  // confirm register class by class ID (classID)
  if (req.isAuthenticated()) {
    let user = req.session.passport.user;
    let uID = user.uID;
    let classID = Number(req.body.classID);

    try {  
      // update user class registration
      const db = await connectDB();
      const colUser = db.collection("user");
      const colClass = db.collection("class");
      const dataUser = await colUser.find({ uID: uID }).toArray();
      const dataClass = await colClass.find({ classID: classID }).toArray();
      const userCredit = Number(dataUser[0].Credit);

      let finalCredit = Number(dataUser[0].Credit) + Number(dataClass[0].classCredit);    // i.e user existing credit sum with refund credit
      console.log("[info] update user credit after class cancellation:", finalCredit);
      await colUser.updateOne(
        { uID: uID }, 
        { $set: { Credit: finalCredit }}
      );

      const colUserClass = db.collection("userClass");
      await colUserClass.deleteOne({
        uID: user.uID,                               // user ID
        classID: Number(req.body.classID),      // classID; get from fetch body
      });
      res.json({ result: true, msg: "[ 你現有 Credit (" + userCredit + "); 所選課程成功取消報讀登記 ]" });
    } catch(err) {
      res.json({ result: false, msg: "[ 取消報讀登記課程發生錯誤: " + err + " ]"});         
    } finally { 
      await closeDB();
    };
  } else res.redirect("/");    
});

router.get('/classType', async function (req, res, next) {
  try {
      const db = await connectDB();
      const classTypes = db.collection("classType");

      const data = await classTypes.find().toArray();
      res.json(data);
  } finally {
      await closeDB();
  }
});

router.get('/getCourses', async function (req, res, next) {
  // get all courses before current date
  try {
      const db = await connectDB();
      const classList = db.collection("joinClassScheduleLocStateTutor");

      const data = await classList.find({classSchedule: {$gte: new Date()}}).sort({ classType: 1, classSchedule: 1 }).toArray();
      res.json(data);
  } finally {
      await closeDB();
  }
});

router.get('/getCourses/:classType', async function (req, res, next) {
  // get all courses before current date by classType
  try {
      const db = await connectDB();
      const classList = db.collection("joinClassScheduleLocStateTutor");

      if (typeof (req.params.classType) != "undefined") {
        req.body.classType = Number(req.params.classType);
      }
      req.body.classSchedule = {$gte: new Date()};

      const data = await classList.find(req.body).sort({ classType: 1, classSchedule: 1 }).toArray();
      res.json(data);
     
  } finally {
      await closeDB();
  }
});

module.exports = router;
