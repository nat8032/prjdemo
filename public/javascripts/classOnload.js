document.addEventListener('DOMContentLoaded', async function () { await fetchID(id); });
async function fetchID(id) {
    const formData = new URLSearchParams();
    formData.append("classID", id);
    try {
        const response = await fetch("/admin/classDetails", {
            method: "POST",
            body: formData,
        })
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const json = await response.json();
        if (json.length == 0) {
            let html = "<div class='container'> <div style='padding: 20px;'>No available data can be found.</div></div>"
            return document.getElementById("searchResult").innerHTML = html;
        }
        let html = "<div class='container'> <div style='padding: 20px;'> <table width='100%' border='1'><tr style='background: linear-gradient(0deg, #2BABC5 0%, #0dcaf0 100%);'><th>Items</th><th>Details</th></tr>"
        // console.log("json", json)
        json.map(row => {
            const { classID, className, classCredit, classSchedule, locationDetails, stateDetails } = row;
            html += "<tr><td>Class ID</td><td>" + classID + "</td></tr>"
            html += "<tr><td>Description</td><td>" + className + "</td></tr>"
            html += "<tr><td>Credit</td><td>" + classCredit + "</td></tr>"
            html += "<tr><td>Schedule</td><td>" + classSchedule.slice(0,16).replace("T"," Time ") + "</td></tr>"
            html += "<tr><td>Location</td><td>" + locationDetails + "</td></tr>"
            html += "<tr><td>State</td><td>" + stateDetails + "</td></tr>"
        })
        html += "</table></div></div>"

        // loop through json and create html accordingly
        document.getElementById("searchResult").innerHTML = html;
    } catch (error) {
        console.log(error.message);
    }

    try {
        const response = await fetch("/admin/classUser", {
            method: "POST",
            body: formData,
        })
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const json = await response.json();
        if (json.length == 0) {
            let html = "<div class='container'> <div style='padding: 20px;'>No user applied this class yet.<br/><br/>"
            html += '<button type="button" onclick="cancelClass(' + id + ')">Cancel Class</button></div></div>'
            return document.getElementById("classUser").innerHTML = html;
        }
        let html = "<div class='container'> <div style='padding: 20px;'><p>User applied: </p>"
        html += "<table width='100%' border='1'><tr style='background: linear-gradient(0deg, #2BABC5 0%, #0dcaf0 100%);'><th>User ID</th><th>Apply Date</th><th>Cancal</th><th>Details</th></tr>"
        // console.log("json", json)
        json.map(row => {
            const { uID, applyDate, classID } = row;
            html += "<tr>"
            html += "<td>" + uID + "</td>"
            html += "<td>" + applyDate.slice(0,16).replace("T"," Time ")  + "</td>"
            html += "<td>" + `<button type='button' onclick="deleteClassUser(` + uID + `,`+ classID + `)">Cancal</button>` + "</td>";
            html += "<td>" + `<a href="../admin/userDetails?id=` + uID + `"><button type='button'>Details</button></a>` + "</td>";
            html += "</tr>";
        })
        html += "</table></div></div>"

        // loop through json and create html accordingly
        document.getElementById("classUser").innerHTML = html;

    } catch (error) {
        console.log(error.message);
    }
}

async function cancelClass(classID) {
    const isConfirm = confirm("Are you sure want to Cancel Class?")

    if (!isConfirm) return;

    const formData = new URLSearchParams();
    formData.append("classID", classID);
    try {
        const response = await fetch("/admin/cancelClass", {
            method: "POST",
            body: formData,
        })
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const json = await response.json();
        alert(json);
        // load another page
        window.location.href = '/admin';

    } catch (error) {
        console.log(error.message);
    }
}