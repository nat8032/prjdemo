document.addEventListener('DOMContentLoaded', function () { fetchForm(); });

async function fetchForm() {
    await fetch('/admin/createNewForm')
        .then(response => response.json())
        .then((datas) => {
            formSelectValue(datas); // get the data from backend and pass to the function 
        })
        .catch(error => console.error('Error:', error));
}
// data.push(newClassID, classType, classState, classLocation, userTutor)
function formSelectValue(datas) {
    const newClassID = datas[0], classTypes = datas[1], classStates = datas[2], classLocations = datas[3], userTutors = datas[4]; // divide the data array
    // create the combo box with the data
    const newClassIDSelect = document.getElementById('classID');
    const option = document.createElement('option');
    option.value = newClassID;
    option.textContent = newClassID;
    newClassIDSelect.appendChild(option);

    const classTypesSelect = document.getElementById('classType');
    classTypesSelect.appendChild(document.createElement('option'));
    classTypes.forEach(classType => {
        const option = document.createElement('option');
        option.value = classType["classType"];
        option.textContent = classType["classCategory"];
        classTypesSelect.appendChild(option);
    });

    const classStateSelect = document.getElementById('stateID');
    classStateSelect.appendChild(document.createElement('option'));
    classStates.forEach(classState => {
        const option = document.createElement('option');
        option.value = classState["stateID"];
        option.textContent = classState["stateDetails"];
        classStateSelect.appendChild(option);
    });
    const classLocationsSelect = document.getElementById('locationID');
    classLocationsSelect.appendChild(document.createElement('option'));
    classLocations.forEach(classLocation => {
        const option = document.createElement('option');
        option.value = classLocation["locationID"];
        option.textContent = classLocation["locationDetails"];
        classLocationsSelect.appendChild(option);
    });
    const userTutorsSelect = document.getElementById('tuturID');
    userTutorsSelect.appendChild(document.createElement('option'));
    userTutors.forEach(userTutor => {
        const option = document.createElement('option');
        option.value = userTutor["uID"];
        option.textContent = userTutor["uName"];
        userTutorsSelect.appendChild(option);
    });
    const maxSeatSelect = document.getElementById('maxSeat');
    maxSeatSelect.appendChild(document.createElement('option'));
    for (let i=1; i<=5;i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        maxSeatSelect.appendChild(option);
    }
    const classCreditSelect = document.getElementById('classCredit');
    classCreditSelect.appendChild(document.createElement('option'));
    for (let i=1; i<=5;i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        classCreditSelect.appendChild(option);
    }
    const classDurationSelect = document.getElementById('classDuration');
    classDurationSelect.appendChild(document.createElement('option'));
    for (let i=1; i<=8;i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        classDurationSelect.appendChild(option);
    }

}

async function createNewClass() {
    let formComplete = true;
    const form = document.querySelectorAll('form')[0], formData = new URLSearchParams();
    Array.from(form.elements).filter(input => input.type != 'button').forEach((input) => {
        console.log("input.name: " + input.name);
        console.log("input.value: " + input.value);
        if (input.value=="") {
            formComplete = false;
        };
        if (input.value.trim() != "") {
            formData.append(input.name, input.value);
        }
    });        
    if (!formComplete) {
        return alert("All feild must be input and selected")
    }
    try {
        const response = await fetch("/admin/createClass", {
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