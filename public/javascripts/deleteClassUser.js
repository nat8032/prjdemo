async function deleteClassUser(uID, classID) {

    const isConfirm = confirm("Are you sure want to cancel?")

    if (!isConfirm) return;

    const url = '/admin/deleteClassUser/' + uID + '/' + classID;
    console.log("function deleteClassUser url: ");
    console.log(url);
    await fetch(url, {
        method: 'POST',
    })
        .then(response => response.json()) 
        .then((data) => {

            // document.getElementById('message').innerHTML = data.message;
            // fetchID(uID); // refresh the data
            alert(data);
            // load another page
            window.location.href = '/admin';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}