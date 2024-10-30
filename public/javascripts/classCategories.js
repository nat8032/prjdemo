document.addEventListener('DOMContentLoaded',async function(){ await fetchTypes(); await fetchCourses(`${category}`); });

async function fetchTypes() {
    await fetch('/classes/classType')
        .then(response => response.json())
        .then((datas) => {
            populateTypeSelect(datas); // get the data from backend and pass to the function 
        })
        .catch(error => console.error('Error:', error));
}

function populateTypeSelect(datas){
    const types = datas; 
    // create the combo box with the data                                                                                                                        
    const classTypeSelect = document.getElementById('classType');
    classTypeSelect.appendChild(document.createElement('option'));
      types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.classType;                                                                                
        option.textContent = type.classCategory;
        if (type.classType === category) {
          option.selected = true;
        }
        classTypeSelect.appendChild(option);
    });

}

async function fetchCourses(category = '') {
    try {
        const response = await fetch('/classes/getCourses');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const datas = await response.json(); 
            
        populateCourses(datas, category); 
  
    } catch (error) {
      console.log('get courses data error', error);
    }
}
  
  function populateCourses(datas,category = '') {
    try {
  
      let courseList = document.getElementById('courseList');
      courseList.innerHTML = ''; // clear the table first

      const filteredCourses = Number(category) === 0 ? datas : 
          datas.filter(data => data.classType === Number(category));
  
      let r = 0;
      filteredCourses.forEach(item => {
        r += 1;
        item.classImg ? imageURL = '<img src="' + item.classImg + '" alt="' + item.className + '">' : imageURL = '';
        item.stateID !=1 ? vIsDisabled = 'disabled' : vIsDisabled = '';

        // prepare for current date time (translate to mongodb datetime format and set with time zone)
        let startDate = new Date(item.classSchedule);
        let cYear = startDate.getFullYear();
        let cMonth = ("0" + (startDate.getMonth() + 1)).slice(-2);
        let cDate = ("0" + startDate.getDate()).slice(-2);
        let cHour = ("0" + startDate.getHours()).slice(-2);
        let cMin = ("0" + startDate.getMinutes()).slice(-2);
        let cstartDateTime = cYear + '-' + cMonth + '-' + cDate +' '+ cHour + ':' + cMin;
  
        const courseItem = document.createElement('div');
        courseItem.classList.add('course-item', 'border', 'p-3', 'rounded');

        (r % 2 === 0) ? courseItem.classList.add('even_row') : courseItem.classList.add('odd_row');
        
        if (r % 2 === 1){
          courseItem.innerHTML = 
            '<div class="d-flex col-6 flex-column image-container justify-content-center align-items-center">' + imageURL + '</div>' + 
              '<div class="col-6 d-flex flex-column course-item-text justify-content-center align-items-start"><h3>' + item.className + '</h3>'+
              '<p>' + item.classDetails + '</p>' +
              '<p> 上課日期：' + cstartDateTime + '&nbsp;&nbsp;&nbsp;授課老師：' + item.tutorName + '</p>' +
              '<span class="align-middle" style="margin-bottom: 1rem;"><p class="fw-medium">[' + item.stateDetails + ']</p></span>'+
              '<button '+ vIsDisabled +' type="button" class="btn btn-outline-secondary" style="background: #ad9731; color: white;" onclick="getClassDetail(\'' + item.classID + '\');">立即報名</button>'+
              '</div>';
        } else {
          courseItem.innerHTML = 
              '<div class="col-6 d-flex flex-column course-item-text justify-content-center align-items-start"><h3>' + item.className + '</h3>'+
              '<p>' + item.classDetails + '</p>' +
              '<p> 上課日期：' + cstartDateTime + '&nbsp;&nbsp;&nbsp;授課老師：' + item.tutorName + '</p>' +
              '<span class="align-middle" style="margin-bottom: 1rem;"><p class="fw-medium">[' + item.stateDetails + ']</p></span>'+
              '<button '+ vIsDisabled +' type="button" class="btn btn-outline-secondary" style="background: #ad9731; color: white;" onclick="getClassDetail(\'' + item.classID + '\');">立即報名</button>'+
              '</div>' +
              '<div class="d-flex col-6 flex-column image-container justify-content-center align-items-center">' + imageURL + '</div>';              
        }
        courseList.appendChild(courseItem);
      });
  
    } catch (error) {
      console.log('populate courses data error', error);
    }
  }

  function filterCoursesByCategory() {
    const classTypeSelect = document.getElementById('classType');
    const classCategory = classTypeSelect.value;
    const url = '/classes/getCourses/' + classCategory;
    fetch(url)
     .then(response => response.json())
     .then((datas,classCategory) => {
        populateCourses(datas, classCategory); // get the data from backend and pass to the function 
      })
     .catch(error => console.error('Error:', error));
  }

function getClassDetail(classID) {
  window.location.href = '/classes/regClass/' + classID;
}