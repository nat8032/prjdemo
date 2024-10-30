document.addEventListener('DOMContentLoaded', async function () { await fetchID(id); });
async function fetchID(id) {
    const formData = new URLSearchParams();
    formData.append("uID", id);
    try {
        const response = await fetch("/admin/userList", {
            method: "POST",
            body: formData,
        })
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const json = await response.json();
        if (json.length == 0) {
            let html = "<div class='container'> <div style='padding: 20px;'>No available data can be found.</div></div>"
            return document.getElementById("searchResult").innerHTML = html;
        }
        let html = "<div class='container'> <div style='padding: 20px;'> <table width='100%' border='1'><tr style='background: linear-gradient(0deg, #2BABC5 0%, #0dcaf0 100%);'><th>uID</th><th>Name</th><th>Credit</th></tr>"
        // console.log("json", json)
        let r = 0;
        json.map(row => {
            const { uID, uName, Credit } = row;
            r += 1;
            if ((r % 2) == 0) {
                html += "<tr style='background: linear-gradient(0deg, #C5D7E6 0%, #C5D7E6 100%);'>"
            } else {
                html += "<tr>"
            }
            html += "<td>" + uID + "</td>"
            html += "<td>" + uName + "</td>"
            html += "<td>" + Credit + "</td>"
            // html += "<td>" + `<a href="../admin/userDetails?id=` + uID + `"><button type='button'>Details</button></a>` + "</td>";
            html += "</tr>";
            // console.log({ uID, uName, Credit });
        })
        html += "</table></div></div>"

        // loop through json and create html accordingly
        document.getElementById("searchResult").innerHTML = html;
    } catch (error) {
        console.log(error.message);
    }
    let html = '<td><button type="button" class="btn btn-info" onclick="updateUserCredit(' + id + ')">Confirm</button></td>'
    document.getElementById("updateCredit").innerHTML = html;

    try {
        const response = await fetch("/admin/userDetails", {
            method: "POST",
            body: formData,
        })
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const json = await response.json();
        let html = "<div class='container'> <div style='padding: 20px;'><p>Class applied: </p>"
        html += "<table width='100%' border='1'><tr style='background: linear-gradient(0deg, #2BABC5 0%, #0dcaf0 100%);'><th>Class ID</th><th>Description</th><th>Credit</th><th>Schedule</th><th>Cancel</th><th>Details</th></tr>"
        // console.log("json", json)
        json.map(row => {
            const { uID, classID, className, classCredit, classSchedule } = row;
            html += "<tr>"
            html += "<td>" + classID + "</td>"
            html += "<td>" + className + "</td>"
            html += "<td>" + classCredit + "</td>"
            html += "<td>" + classSchedule.slice(0,16).replace("T"," Time ")  + "</td>";
            html += "<td>" + `<button type='button' onclick="deleteClassUser(` + uID + `,`+ classID + `)">Cancal</button>` + "</td>";
            html += "<td>" + `<a href="../admin/classDetails?id=` + classID + `"><button type='button'>Details</button></a>` + "</td>";
            html += "</tr>";
            // console.log({ uID, classID, className, classCredit, classSchedule });
        })
        html += "</table></div></div>"

        // loop through json and create html accordingly
        document.getElementById("userClass").innerHTML = html;

    } catch (error) {
        console.log(error.message);
    }
}

async function updateUserCredit(uID) {

    const isConfirm = confirm("Are you sure want to update?")

    if (!isConfirm) return;

    const form = document.querySelectorAll('form')[0], formData = new URLSearchParams();
    Array.from(form.elements).filter(input => input.type != 'button').forEach((input) => {
        if (input.value.trim() != "") {
            formData.append(input.name, input.value);
        }
    });

    const url = '/admin/updateUserCredit/' + uID;

    await fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then((data) => {

            document.getElementById('message').innerHTML = data.message;
            fetchID(uID); // refresh the data
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}