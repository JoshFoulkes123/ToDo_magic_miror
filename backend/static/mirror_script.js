console.log("hello from mirror js")



async function loadTasks(command) {
  const response = await fetch(`${command}`);
  const data = await response.json();
  console.log("received data")
  tasks = data;
  console.log(data);
  tasks.forEach((x) => x.last_completed = new Date(x.last_completed));
  updateUrgency();

  set_dashboard_tasks();
  


  
}


async function getWeather() {
    const response = await fetch(`/weather`);
    const data = await response.json();
    console.log("received data")
    console.log(data);

    let sat_weather = document.getElementById("sat_weather").children;
    let sun_weather = document.getElementById("sun_weather").children;
  

    console.log(sat_weather)
    sat_weather[0].innerHTML = Weather_date_line(data[0]);
    sat_weather[1].innerHTML = Weather_desc_line(data[0]);
    sat_weather[2].src = data[0]["image"];
    sat_weather[3].innerHTML = Weather_temp_line(data[0]);
    sat_weather[4].innerHTML = Weather_sunset_line(data[0]);

    sun_weather[0].innerHTML = Weather_date_line(data[1]);
    sun_weather[1].innerHTML = Weather_desc_line(data[1]);
    sun_weather[2].src = data[1]["image"];
    sun_weather[3].innerHTML = Weather_temp_line(data[1]);
    sun_weather[4].innerHTML = Weather_sunset_line(data[1]);

    
        
}

getWeather();

function Weather_date_line(data){
    let date = new Date(data["date"]);
    console.log(date)
    let weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    let Months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    return (`${weekdays[date.getDay()]} ${date.getDate()} ${Months[date.getMonth()]}`)
}
function Weather_desc_line(data){
    return(`${data["weather_code"]}  ${data["precipitation_probability_max"]}%`)
}
function Weather_temp_line(data){
    return(`${data["temperature_2m_max"]}C / ${data["temperature_2m_min"]}C`)
}
function Weather_sunset_line(data){
    let sunset = new Date(data["sunset"]);
    let min = checkTime(sunset.getMinutes())
    return(`Sunset: ${sunset.getHours()+1}:${min}`)
}


let tasks = [];

// const tasks = [
//     {
//         id: 0,
//         name: "clean toilet",
//         repeat: 3,
//         last_completed: new Date(2026, 1, 13),
//         urgency: 0,
//         days_left: 0,
//     },
//     {
//         id: 1,
//         name: "clean sheets",
//         repeat: 2,
//         last_completed: new Date(2026, 1, 24),
//         urgency: 0,
//         days_left: 0,
//     },
//     {
//         id: 2,
//         name: "take out recycling",
//         repeat: 1,
//         last_completed: new Date(2026, 2, 1),
//         urgency: 0,
//         days_left: 0,
//     },
//     {
//         id: 3,
//         name: "clean fridge",
//         repeat: 4,
//         last_completed: new Date(2026, 1, 20),
//         urgency: 0,
//         days_left: 0,
//     },
//     {
//         id: 4,
//         name: "clean oven",
//         repeat: 8,
//         last_completed: new Date(2025,11,12),
//         urgency: 0,
//         days_left: 0,
//     },
// ];

function updateUrgency(){
    tasks.forEach((x) => {
        let Epoch_days = Math.floor(new Date().getTime()/8.64e7);
        let urgency_day = Epoch_days - (x.last_completed.getTime()/8.64e7)-7*x.repeat;
        x.days_left = Math.max(0,urgency_day*-1);
        // console.log(x)
        // console.log(urgency_day)
        if(urgency_day > 0){
            x.urgency = 2;
        }else if (urgency_day < 1 && urgency_day > -2){
            x.urgency =1;
        }else{
            x.urgency = 0;
        }
    });
}

updateUrgency();

function HTML_task_creator(task){
    let Epoch_days = Math.floor(new Date().getTime()/8.64e7);
    let urgency_day = Epoch_days - 0;
    let due_date = new Date(0);
    due_date.setUTCMilliseconds(task.last_completed.getTime()+task.repeat*7*24*60*60*1000);
    let html_out = `<div class="upcoming task_display">
                        <h3 class="task_name">${task.name}</h3>
                        <p>Last Completed: <date>${task.last_completed.getDate()}/${task.last_completed.getMonth()+1}/${task.last_completed.getFullYear()}</date> <p>
                        <p>Next Due Date: <date>${due_date.getDate()}/${due_date.getMonth()+1}/${due_date.getFullYear()}</date> <p>
                        <p>Repeats: ${task.repeat}<p>
                    </div>
                    <br>`;
    return html_out;
}


let late_dashboard = document.getElementById("late_task_dashboard");
let today_dashboard = document.getElementById("today_task_dashboard");
let tomorrow_dashboard = document.getElementById("upcoming_task_dashboard");

let tomorrow_tasks_idx =0;
let late_tasks_idx = 0;
let today_tasks_idx = 0;

function set_dashboard_tasks(){

    updateUrgency();
    let tomorrow_tasks = tasks.filter((x) =>{ 
        if(x.days_left < 7 && x.days_left > 1){
            return true;
        }
        return false;

    })
    // .sort((x) => {
    //     if (a.days_left < b.days_left ){
    //         return -1;
    //     }else if (a.days_left == b.days_left ){
    //         if (a.id < b.id ){
    //             return -1;
    //         }
    //         return 1;
    //     }
    //     return 1;  
    // });
    let today_tasks = tasks.filter((x) =>{ 
        if(x.urgency == 1){
            return true;
        }
        return false;

    })
    // .sort((x) => {
    //     if (a.name < b.name ){
    //         return -1;
    //     }
    //     return 1;
    // });

    let late_tasks = tasks.filter((x) =>{ 
        if(x.urgency > 1){
            return true;
        }
        return false;

    });

    late_tasks_idx = late_tasks_idx + 1;
    if(late_tasks_idx >= late_tasks.length){
        late_tasks_idx = 0;
    }

    today_tasks_idx = today_tasks_idx + 1;
    if(today_tasks_idx >= today_tasks.length){
        today_tasks_idx = 0;
    }

    tomorrow_tasks_idx = tomorrow_tasks_idx + 1;
    if(tomorrow_tasks_idx >= tomorrow_tasks.length){
        tomorrow_tasks_idx = 0;
    }





    HTML_task_all = [];
    // tomorrow_tasks.forEach((x) => HTML_task_all.push(HTML_task_creator(x)));
    
    if(tomorrow_tasks.length != 0 ){
        HTML_task_all.push(HTML_task_creator(tomorrow_tasks[tomorrow_tasks_idx]));
        HTML_task_all.unshift(`<hr><h2>Upcoming tasks (${tomorrow_tasks_idx+1} of ${tomorrow_tasks.length})</h2>`)
        HTML_task_all.push("<hr>")
    }
    tomorrow_dashboard.innerHTML = HTML_task_all.join("");
    
    HTML_task_all = [];
    // today_tasks.forEach((x) => HTML_task_all.push(HTML_task_creator(x)));
    
    if(today_tasks.length != 0 ){
        HTML_task_all.push(HTML_task_creator(today_tasks[today_tasks_idx]));
        HTML_task_all.unshift(`<hr><h2>Today's tasks (${today_tasks_idx+1} of ${today_tasks.length})</h2>`)
        HTML_task_all.push("<hr>")
    }
    today_dashboard.innerHTML = HTML_task_all.join("");

    HTML_task_all = [];
    // late_tasks.forEach((x) => HTML_task_all.push(HTML_task_creator(x)));
    
    if(late_tasks.length != 0 ){
        HTML_task_all.push(HTML_task_creator(late_tasks[late_tasks_idx]));
        HTML_task_all.unshift(`<hr><h2>Late Tasks (${late_tasks_idx+1} of ${late_tasks.length})</h2>`)
        HTML_task_all.push("<hr>")
    }

    late_dashboard.innerHTML = HTML_task_all.join("");


}


function startTime() {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById('clock_display').innerHTML =  h + ":" + m + ":" + s;
  setTimeout(startTime, 1000);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

function loop_tasks(){
    loadTasks("/Task_table");
    setTimeout(loop_tasks,10000);
}

loadTasks("/Task_table");
startTime();
loop_tasks();



