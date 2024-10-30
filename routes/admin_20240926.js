var express = require('express');
var router = express.Router();
var path = require("path");
var { connectDB, closeDB } = require('../config/database');
const multer = require('multer');
const upload = multer({ dest: 'tmp/', limits: { fileSize: 10240 * 1024 /* in bytes */ } });
const fs = require('fs');

/* GET users listing. */
router.get('/', async function (req, res, next) {
    // await res.sendFile(path.join(__dirname, "../public/admin.html"))
    if (req.isAuthenticated()) {
        if (req.session.passport.user.uLevel == 1) {
            res.render("admin", {
                title: "ERB Hobby Workshop",
                user: req.session.passport.user,
            });
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/users/login");
    }
});
router.post('/classDistinct', async function (req, res, next) {
    try {
        const db = await connectDB();
        const classID = db.collection("class");
        const data = await classID.distinct().toArray();
        res.json(data);
    } finally {
        await closeDB();
    }
});
router.post('/userList', async function (req, res, next) {
    try {
        const db = await connectDB();
        const user = db.collection("user");
        if ((typeof (req.body.uID) != "undefined") && (req.body.uID != "admin")) {
            // change string to integer
            req.body.uID = Number(req.body.uID);
        }
        let skip = 0;
        if (req.body.skip) {
            skip = parseInt(req.body.skip);
        }

        const query = { ...req.body };
        delete query.skip; // Remove skip from the query

        if (skip < 0) {
            skip = 0;
        }

        const data = await user.find(query).skip(skip).limit(10).toArray();
        // const data = await user.find(req.body).toArray();

        res.json(data);
    } finally {
        await closeDB();
    }
});
router.post('/class', async function (req, res, next) {
    try {
        const db = await connectDB();
        const classID = db.collection("class");
        if (typeof (req.body.classID) != "undefined") {
            req.body.classID = Number(req.body.classID);
        }
        let skip = 0;
        if (req.body.skip) {
            skip = parseInt(req.body.skip);
        }

        const query = { ...req.body };
        delete query.skip; // Remove skip from the query

        if (skip < 0) {
            skip = 0;
        }

        const data = await classID.find(query).skip(skip).limit(10).toArray();
        // const data = await classID.find(req.body).toArray();

        // check the class state != 4 (4 means inactive)
        let activeClass = [];
        for (let i = 0; i < data.length; i++) {
            if (Number(data[i].stateID) != 4) {
                activeClass.push(data[i]);
            }
        }
        res.json(activeClass);
    } finally {
        await closeDB();
    }
});
router.get('/userDetails', async function (req, res, next) {
    // res.redirect("../userDetails.html?id=" + req.query.id);
    let id = req.query.id;
    if (req.isAuthenticated()) {
        if (req.session.passport.user.uLevel == 1) {
            res.render("userDetails", {
                title: "ERB Hobby Workshop",
                user: req.session.passport.user,
                id
            });
        } else {
            res.redirect("/");
        };
    } else {
        res.redirect("/users/login");
    }
});
router.post('/userDetails', async function (req, res, next) {
    if ((typeof (req.body.uID) != "undefined") && (req.body.uID != "admin")) {
        // change string to integer
        req.body.uID = Number(req.body.uID);
    }
    try {
        const db = await connectDB();
        const joinUserClassDetails = db.collection("joinUserClassDetails");
        const data = await joinUserClassDetails.find(req.body).toArray();
        res.json(data);
    } finally {
        await closeDB();
    }
});
router.post('/updateUserCredit/:uID', async function (req, res, next) {
    console.log("[log] /updateUserCredit started...");
    try {
        const db = await connectDB();
        const user = db.collection("user");
        const data = await db.collection("user").find({ uID: Number(req.params.uID) }).toArray();
        const updateCredit = Number(data[0].Credit) + Number(req.body.Credit);
        for (let d of data) {
            d.Credit = updateCredit;
            await user.replaceOne({ _id: d._id }, d);
        }
        res.json({ message: "Success: Updated Credit." });
    } catch (error) {
        console.log("[log] /updateUserCredit error:", error);
    } finally {
        await closeDB();
        console.log("[log] /updateUserCredit ended...");
    }
});
router.get('/classDetails', async function (req, res, next) {
    // res.redirect("../classDetails.html?id=" + req.query.id);
    let id = req.query.id;
    if (req.isAuthenticated()) {
        if (req.session.passport.user.uLevel == 1) {
            res.render("classDetails", {
                title: "ERB Hobby Workshop",
                user: req.session.passport.user,
                id
            });
        } else {
            res.redirect("/");
        };
    } else {
        res.redirect("/users/login");
    }
});
router.post('/classDetails', async function (req, res, next) {
    if (typeof (req.body.classID) != "undefined") {
        // change string to integer
        req.body.classID = Number(req.body.classID);
    }
    try {
        const db = await connectDB();
        const classDetails = db.collection("joinClassScheduleLocState");
        const data = await classDetails.find(req.body).toArray();
        res.json(data);
    } catch (error) {
        console.log("[log] /classDetails error:", error);
    } finally {
        await closeDB();
        console.log("[log] /classDetails ended...");
    }
});
router.post('/classUser', async function (req, res, next) {
    if (typeof (req.body.classID) != "undefined") {
        // change string to integer
        req.body.classID = Number(req.body.classID);
    }
    try {
        const db = await connectDB();
        const joinUserClassDetails = db.collection("joinUserClassDetails");
        const data = await joinUserClassDetails.find(req.body).toArray();
        res.json(data);
    } catch (error) {
        console.log("[log] /classUser error:", error);
    } finally {
        await closeDB();
        console.log("[log] /classUser ended...");
    }
});
router.post('/deleteClassUser/:uID/:classID', async function (req, res, next) {
    console.log("[log] /deleteClassUser started...");
    try {
        console.log("deleteClassUser: ");
        console.log("req.params.uID: ");
        console.log(req.params.uID);
        console.log("req.params.classID: ");
        console.log(req.params.classID);

        const db = await connectDB();
        const userClass = db.collection("userClass");
        const data = await db.collection("userClass").find({ $and: [{ uID: Number(req.params.uID) }, { classID: Number(req.params.classID) }] }).toArray();
        const data_del = await db.collection("userClass").deleteOne({ $and: [{ uID: Number(req.params.uID) }, { classID: Number(req.params.classID) }] });
        if (data_del.deletedCount === 0) {
            return res.json({ message: "Failed: No reserved spot found." });
        }
        console.log("deleteClassUser data:");
        console.log(data);
        res.json("Success:  Application Cancelled.");
    } catch (error) {
        console.log("[log] /updateUserCredit error:", error);
    } finally {
        await closeDB();
        console.log("[log] /updateUserCredit ended...");
    }
});
router.get('/createClassForm', async function (req, res, next) {
    // await res.sendFile(path.join(__dirname, "../public/createClassForm.html"))
    if (req.isAuthenticated()) {
        if (req.session.passport.user.uLevel == 1) {
            res.render("createClassForm", {
                title: "ERB Hobby Workshop",
                user: req.session.passport.user,
            });
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/users/login");
    }
});
router.get('/createNewForm', async function (req, res, next) {
    console.log("[log] /createNewForm started...");
    try {
        const db = await connectDB();
        const classC = db.collection("class");
        const userTutorC = db.collection("user");
        const classTypeC = db.collection("classType");
        const classStateC = db.collection("classState");
        const classLocationC = db.collection("classLocation");
        // find the greatest ClassID
        const newClassID = ((await (classC.find().sort({ 'classID': -1 })).toArray())[0].classID + 1);
        const classType = await classTypeC.find().toArray();
        const classState = await classStateC.find().toArray();
        const classLocation = await classLocationC.find().toArray();
        const userTutor = await userTutorC.find({ uLevel: 2 }).toArray();

        const data = [];
        data.push(newClassID, classType, classState, classLocation, userTutor)
        res.json(data);
    } catch (error) {
        console.log("[log] /createNewForm error:", error);
    } finally {
        await closeDB();
        console.log("[log] /createNewForm ended...");
    }
});

router.post('/createClass', upload.single('classImg'), async function (req, res, next) {
    console.log("[log] /Create New Class started...");

    if (!fs.existsSync("public/images")) fs.mkdirSync("public/images");
    // console.log("file", req.file.path);
    // res.end();
    fs.renameSync(req.file.path, "public/images/" + Buffer.from(req.file.originalname, 'latin1').toString('UTF-8'));
    // res.send("req.file.originalname/<br/>" + req.file.originalname + "----- public/images/<br/>" + req.body.description);
    // console.log(req.file.originalname);
    try {
        console.log(req.body);
        const db = await connectDB();
        const classC = db.collection("class");
        const classScheduleC = db.collection("classSchedule");
        const insertClass = await classC.insertOne({
            classID: Number(req.body.classID),
            className: req.body.className,
            classType: Number(req.body.classType),
            classDetails: req.body.classDetails,
            classCredit: Number(req.body.classCredit),
            stateID: Number(req.body.stateID),
            classImg: "/images/" + req.file.originalname,
        });
        const insertClassSchedule = await classScheduleC.insertOne({
            classID: Number(req.body.classID),
            tutorID: Number(req.body.uID),
            classSchedule: new Date(req.body.classSchedule),
            classDuration: Number(req.body.classDuration),
            locationID: Number(req.body.locationID),
            maxSeat: Number(req.body.maxSeat),
        });

        console.log("[log] /Create New Class ended...")
        // res.json("New Class Added");
        res.redirect("/admin");
    } catch (error) {
        console.log("[log] /createClass error:", error);
    } finally {
        await closeDB();
        console.log("[log] /createClass ended...");
    }
});

router.post('/cancelClass', async function (req, res, next) {
    console.log("[log] /Cancel Class started...");
    try {
        const db = await connectDB();
        const classC = db.collection("class");
        const deleteClass = await classC.findOne({ classID: Number(req.body.classID) });
        console.log(deleteClass);
        deleteClass.stateID = 4;
        console.log(deleteClass);
        await classC.replaceOne({ classID: Number(req.body.classID) }, deleteClass);
        console.log(await classC.find({ classID: Number(req.body.classID) }).toArray());

        // const classScheduleC = db.collection("classSchedule");
        // const deleteClassSchedule = await classScheduleC.deleteOne({ classID: Number(req.body.classID) });
        // if (deleteClass.deletedCount === 0 || deleteClassSchedule.deletedCount === 0) {
        //     return res.json({ message: "Failed: class is not exsited." });
        // }
        res.json("Success:  Class Cancelled.");

    } catch (error) {
        console.log("[log] /cancelClass error:", error);
    } finally {
        await closeDB();
        console.log("[log] /cancelClass ended...");
    }
});

// router.post('/uploadImage', upload.single('classImg'), async (req, res, next) => {
//     console.log("[log] /uploadImage started...");
//     if (!fs.existsSync("public/images")) fs.mkdirSync("public/images");
//     fs.renameSync(req.file.path, "public/images/" + Buffer.from(req.file.originalname, 'latin1').toString('UTF-8'));
//     // res.send(req.file.originalname + "public/images/<br/>" + req.body.description);
//     res.json({ message: "Success: Upload Image." });
// })

module.exports = router;
