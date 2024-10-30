async function getuserRegMM() {
    const classSchedule = document.getElementById("classSchedule").value;
    const url = "/admin/rpt_userRegMM/" + classSchedule;

    await fetch(url)
     .then(response => response.json())
     .then(data => {
        let html = "<table class='table table-bordered'><thead><tr><th>課程類別</th><th>已報名人數</th><th>可供報名人數</th><th>%</th></tr></thead><tbody>";
        data.forEach(item => {
          html += "<tr><td>" + item.classCategory + "</td><td>" + item.totalRegistrations + "</td><td>" + item.totalSeats + "</td><td>" + (item.totalRegistrations*100/item.totalSeats).toFixed(2) +"</td></tr>";
        });
         html += "</tbody></table>";
        document.getElementById("searchResult").innerHTML = html;
        
      })
     .catch(error => console.error("error"));
}
/*
router.get('/rpt_userRegMM/:classSchedule', async function (req, res, next) {
    console.log("[log] /rpt_userRegMM started...");
    try {
        let pYear = req.params.classSchedule.slice(0,4);
        let pMonth = req.params.classSchedule.slice(5,7);
        let pDay = "01";

        let startMonth = new Date(pYear, pMonth-1, pDay);
        let endMonth = new Date(pYear, pMonth, pDay);

        const db = await connectDB();
        let joinUserClassDetailsType = db.collection("joinUserClassDetailsType");
        let registrations  = await joinUserClassDetailsType.aggregate([          
                {
                    $match: {classSchedule: {$gte: startMonth, 
                                             $lt: endMonth} 
                    }
                },
                {
                    $group: {_id: "$classCategory",
                             classType: { $first: "$classType"},
                             totalRegistrations: {$sum: 1}
                    }
                }            
         ]).toArray();
        
        let joinClassSchedule = db.collection("joinClassSchedule");
        let courseCategories = await joinClassSchedule.aggregate([  
                {
                    $match: {classSchedule: {$gte: startMonth, 
                                            $lt: endMonth} 
                    }
                },
                {
                    $group: {_id: "$classType",
                            totalSeats: {$sum: "$maxSeat"}
                    }			
                }
        ]).toArray(); 

        let registrationsMap = new Map();
        registrations.forEach(item => {
            registrationsMap.set(item.classType, item);
        });

        let result = courseCategories.map(category => {
            let registrationData = registrationsMap.get(category._id) || { totalRegistrations: 0, maxSeat: 0 };
            return {
              classType: category._id,
              classCategory: registrationData._id,
              totalRegistrations: registrationData.totalRegistrations,
              totalSeats: category.totalSeats 
            };
          });

          console.log(result);
*/
/*        
        data.forEach((item) => {
            let classType = item.classType;
            let totalSeats = 0;
            data2.forEach((item2) => {
                if(item2._id == classType){
                    totalSeats = item2.totalSeats;
                }
            });
            item.totalSeats = totalSeats;
        });
*/

/*
        res.json(result);
    } catch (error) {
        console.log("[log] /rpt_userRegMM error:", error);
    } finally {
        await closeDB();
        console.log("[log] /rpt_userRegMM ended...");
    }
});

*/