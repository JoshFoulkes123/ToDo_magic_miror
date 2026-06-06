// var socket = io();

// // Listen for the specific broadcast event
// socket.on('database_updated', function(data) {
//     console.log("Server says: Data changed! Refreshing...");
    
//     // Trigger your refresh function
//     loadDatabaseItems(); 
// });

// function loadDatabaseItems() {
//     // Your logic to fetch and display the new items
//     console.log("Fetching new items from database...");
// // }


async function loadTasks(command) {
  const response = await fetch(`${command}`);
  const data = await response.json();
  console.log("received data")
  tasks = data;
  console.log(data);
  tasks.forEach((x) => x.last_completed = new Date(x.last_completed));
  updateUrgency();

  if(today_dashboard){
    set_dashboard_tasks(); 
  }
  

  if (Task_all_display){
    All_tasks_page();
  }

  if(Task_edit_page){
    task_edit_page();
    
  }

  
}

async function completeTask(id){
    let time = new Date();
    
    const response = await fetch(`/Task_table/${id}`, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            last_completed: time
        })
    });

    const result = await response.json();
    console.log(result);
    location.reload();

}

async function addTask(task) {
  const response = await fetch("/Task_table", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(task)
  });

  const result = await response.json();
  console.log(result);
}

async function putTask(task, id) {
  const response = await fetch(`/Task_table/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(task)
  });

  const result = await response.json();
  console.log(result);

}

async function deleteTask(id) {
  const response = await fetch(`/Task_table/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();
  console.log(result);
  location.reload();

}

// document.getElementById("taskForm").addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const task = {
//     title: document.getElementById("title").value,
//     description: document.getElementById("description").value,
//     priority: parseInt(document.getElementById("priority").value)
//   };

//   await addTask(task);
//   loadTasks(); // refresh list
// });

console.log("hello from js")

let tasks = [];
// let tasks = [
//     {
//         id: 0,
//         name: "clean toilet",
//         desc: "clean toilet description",
//         repeat: 3,
//         last_completed: new Date(2026, 1, 13),
//         urgency: 0,
//         days_left: 0,
//     },
//     {
//         id: 1,
//         name: "clean sheets",
//         desc: "clean sheets description",
//         repeat: 2,
//         last_completed: new Date(2026, 1, 20),
//         urgency: 0,
//         days_left: 0,
//     },
//     {
//         id: 2,
//         name: "take out recycling",
//         desc: "take out recycling description",
//         repeat: 1,
//         last_completed: new Date(2026, 2, 25),
//         urgency: 0,
//         days_left: 0,
//     },
//     {
//         id: 3,
//         name: "clean fridge",
//         desc: "clean fridge description",
//         repeat: 4,
//         last_completed: new Date(2026, 1, 20),
//         urgency: 0,
//         days_left: 0,
//     },
//     {
//         id: 4,
//         name: "clean oven",
//         desc: "clean oven description",
//         repeat: 8,
//         last_completed: new Date(2025,11,12),
//         urgency: 0,
//         days_left: 0,
//     },
// ];

console.log(JSON.stringify(tasks[0]));

let Dashboard_btn = document.getElementById("Dashboard_link");
let Setting_btn = document.getElementById("Settings_link");
let Mirror_dashboard_btn = document.getElementById("Mirror_dashboard_link");
let New_task_btn = document.getElementById("New_task_link");
let Edit_task_btn = document.getElementById("Task_view_link");

let all_task_filter = document.getElementById("task_filder_dropdown");

function Power_off(){

    let out = confirm("Are you sure you you want to turn off mirror?");
    if(out){

        console.log("powering off confirmed")
        const response = fetch(`/turn_off`)

    }
}


function updateUrgency(){
    tasks.forEach((x) => {
        let Epoch_days = Math.floor(new Date().getTime()/8.64e7);
        let urgency_day = Epoch_days - (x.last_completed.getTime()/8.64e7)-7*x.repeat;
        x.days_left = Math.max(0,urgency_day*-1);
        if(urgency_day > 0){
            x.urgency = 2;
        }else if (urgency_day < 1 && urgency_day > -2){
            x.urgency =1;
        }else{
            x.urgency = 0;
        }
    });
}

// updateUrgency();



function HTML_task_creator(task){
    let Epoch_days = Math.floor(new Date().getTime()/8.64e7);
    let urgency_day = Epoch_days - 0;
    let due_date = new Date(0);
    due_date.setUTCMilliseconds(task.last_completed.getTime()+task.repeat*7*24*60*60*1000);
    let html_out = `<div class="upcoming task_display">
                        <h3 class="task_name">${task.name}</h3>
                        <p>Decription: ${task.task_desc}</p>
                        <p>Last Completed: <date>${task.last_completed.getDate()}/${task.last_completed.getMonth()+1}/${task.last_completed.getFullYear()}</date> <p>
                        <p>Next Due Date: <date>${due_date.getDate()}/${due_date.getMonth()+1}/${due_date.getFullYear()}</date> <p>
                        <p>Repeats: ${task.repeat}<p>
                        <p>Urgency: ${task.urgency}<p>
                        <button class="detailed_link">See Details</button>
                        <button class="complete_task_link">Complete</button>
                        <button class="delete_task_link">Delete task</button>
                    </div>
                    <br>`;
    return html_out;
}

function HTML_task_creator_dashboard(task){
    let Epoch_days = Math.floor(new Date().getTime()/8.64e7);
    let urgency_day = Epoch_days - 0;
    let due_date = new Date(0);
    due_date.setUTCMilliseconds(task.last_completed.getTime()+task.repeat*7*24*60*60*1000);
    let html_out = `<div class="upcoming task_display">
                        <h3 class="task_name">${task.name}</h3>
                        <p>Next Due Date: <date>${due_date.getDate()}/${due_date.getMonth()+1}/${due_date.getFullYear()}</date> <p>
                        <p>Repeats: ${task.repeat}<p>
                        <p>Urgency: ${task.urgency}<p>
                        <button class="detailed_link">See Details</button>
                        <button class="complete_task_link">Complete</button>
                    </div>
                    <br>`;
    return html_out;
}


let HTML_task_all = [];


function compare(a,b){
    let type = all_task_filter.value;
    switch(type){
        case "Name":
            if (a.name < b.name ){
                return -1;
            }
            return 1;
        case "Urgency":
            if (a.urgency < b.urgency ){
                return 1;
            }else if (a.urgency == b.urgency ){
                if (a.id < b.id ){
                    return -1;
                }
                return -1;
            }
            return 1;
        case "Date":
            if (a.last_completed < b.last_completed ){
                return -1;
            }else if (a.last_completed == b.last_completed ){
                if (a.id < b.id ){
                    return -1;
                }
                return 1;
            }
            return 1;            
        case "Id":
            if (a.id < b.id ){
                return -1;
            }
            return 1;
    }
}
//dashboard functions

let late_dashboard = document.getElementById("late_task_dashboard");
let today_dashboard = document.getElementById("today_task_dashboard");
let tomorrow_dashboard = document.getElementById("upcoming_task_dashboard");

function set_dashboard_tasks(){

    updateUrgency();
    let tomorrow_tasks = tasks.filter((x) =>{ 
        if(x.days_left < 7 && x.days_left > 0){
            return true;
        }
        return false;

    // })
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
    });
    let today_tasks = tasks.filter((x) =>{ 
        if(x.urgency == 1){
            return true;
        }
        return false;

    // })
    // .sort((x) => {
    //     if (a.name < b.name ){
    //         return -1;
    //     }
    //     return 1;
    });

    let late_tasks = tasks.filter((x) =>{ 
        if(x.urgency > 1){
            return true;
        }
        return false;

    });

    HTML_task_all = [];
    tomorrow_tasks.forEach((x) => HTML_task_all.push(HTML_task_creator_dashboard(x)));
    console.log(HTML_task_all.length);
    if(HTML_task_all.length == 0 ){
        HTML_task_all.push("<br><h3>No Upcoming tasks<h3><br><br>")
    }
    tomorrow_dashboard.innerHTML = HTML_task_all.join("");
    
    HTML_task_all = [];
    today_tasks.forEach((x) => HTML_task_all.push(HTML_task_creator_dashboard(x)));
    if(HTML_task_all.length == 0 ){
        HTML_task_all.push("<br><h3>All tasks for today conpleted<h3><br><br>")
    }
    today_dashboard.innerHTML = HTML_task_all.join("");

    HTML_task_all = [];
    late_tasks.forEach((x) => HTML_task_all.push(HTML_task_creator_dashboard(x)));
    
    if(HTML_task_all.length != 0 ){
        HTML_task_all.unshift("<hr><h2>Late Tasks</h2>")
    }
    late_dashboard.innerHTML = HTML_task_all.join("");

    console.log(see_detail_btn);
    
    for(let i =0; i < see_detail_btn.length; i++){
      see_detail_btn[i].addEventListener("click",open_details)
    }
    for(let i =0; i < complete_btn.length; i++){
        complete_btn[i].addEventListener("click",complete_task)
    }




}

if(today_dashboard){
    loadTasks("/Task_table");
    console.log(tasks)
    
    
}



// all tasks page function

let see_detail_btn = document.getElementsByClassName("detailed_link");
let delete_btn = document.getElementsByClassName("delete_task_link");
let complete_btn = document.getElementsByClassName("complete_task_link");

let Task_all_display = document.getElementById("task_display_all");

function set_taskHtml(){
    let sortedTasks = tasks.toSorted(compare);
    HTML_task_all = [];
    console.log("sorted tasks")
    console.log(sortedTasks);
    sortedTasks.forEach((x) => HTML_task_all.push(HTML_task_creator(x)));
    if (Task_all_display){
        Task_all_display.innerHTML = HTML_task_all.join("");
    }
    for(let i =0; i < see_detail_btn.length; i++){
        see_detail_btn[i].addEventListener("click",open_details)
    }
}


let focused_task = 0;

function open_details(){
    let task_name = String(this.parentElement.parentElement.children[0].innerHTML);
    
    focused_task = tasks.filter((x) => x.name == task_name)[0];
    console.log(focused_task);
    // window.open(`task_edit.html?id=${focused_task.id}`, "_self");
    window.open("{{url_for('task_edit')}", "_self");
}

if (Task_all_display){
    loadTasks("/Task_table");
    // All_tasks_page();
    
}

//task edit page function
let Task_edit_page = document.getElementById("edit_task_page");
let Detailed_task_display = document.getElementById("task_display_detailed");

if(Task_edit_page){
    console.log("opening detailed page of this task")
    loadTasks("/Task_table");
    task_edit_page();
    

}

function update_task(){
    const params = new URLSearchParams(window.location.search);
    const itemId = parseInt(params.get('id'));
    let out = confirm("Are you sure you wish to edit this task?");
    if(out){
        let updated_task = {
            // id: Math.max(...tasks.map((x) => x.id))+1,
            id: itemId,
            name: String(document.getElementById("task_name").value),
            task_desc: String(document.getElementById("task_desc").value),
            repeat: parseInt(document.getElementById("task_repeat").value),
            last_completed: new Date(document.getElementById("task_start").value),

        }
        console.log(updated_task);
        putTask(updated_task,itemId);
        document.getElementById("isSuccess").innerHTML = "Task Updated!!"

    }


}

function cancel_task_changes(){
    const params = new URLSearchParams(window.location.search);
    const itemId = parseInt(params.get('id'));
    focused_task = tasks.filter((x) => x.id == itemId)[0]
    document.getElementById("task_name").value = focused_task.name;
    document.getElementById("task_desc").value = focused_task.task_desc;
    document.getElementById("task_start").value = `${focused_task.last_completed.getFullYear()}-${String(focused_task.last_completed.getMonth()+1).padStart(2, '0')}-${focused_task.last_completed.getDate()}`;
    document.getElementById("task_repeat").value = focused_task.repeat;
    document.getElementById("isSuccess").innerHTML = "Changes Canceled!!"
}

//new task page function 
function output_new_task(){
    if(!new_task_name.value || !new_task_desc.value || !document.getElementById("task_start").value || !document.getElementById("task_repeat").value){
        alert("all inputs must be filled");
    }
    else{
        console.log(new_task_name.value);
        console.log(new_task_desc.value);
        console.log(document.getElementById("task_start").value);
        console.log(document.getElementById("task_repeat").value);
        let out = confirm("Are you sure you wish to add this task?");
        if(out){
            console.log(Math.max(...tasks.map((x) => x.id))+1);
            let newTask = {
                // id: Math.max(...tasks.map((x) => x.id))+1,
                name: String(new_task_name.value),
                task_desc: String(new_task_desc.value),
                repeat: parseInt(document.getElementById("task_repeat").value),
                last_completed: new Date(document.getElementById("task_start").value),

            }
            // tasks.push(newTask);   
            //reload_page();
            updateUrgency();
            console.log(newTask);
            addTask(newTask);
            document.getElementById("isSuccess").innerHTML = "New Task added!!"
        }

    }

}

function reload_page(){
    
    // console.log("new task cancelled");
        new_task_name.value = "";
        new_task_desc.value = "";
        document.getElementById("task_start").value = "";
        document.getElementById("task_repeat").value = "";
}

let New_task_page_check = document.getElementById("new_task_page")
if (New_task_page_check){
    console.log("new task page loaded")
    let new_task_name = document.getElementById("new_task_name");
    let new_task_desc = document.getElementById("new_task_desc");
    let new_task_start = document.getElementById("task_start");
    let new_task_repeat = document.getElementById("task_repeat");
    let submit_button = document.getElementById("submit_new_task");
    let cancel_button = document.getElementById("cancel_new_task");
    submit_button.addEventListener("click", output_new_task);
    cancel_button.addEventListener("click", reload_page);

}

function Dashboard_page(){
    set_dashboard_tasks();
}

function All_tasks_page(){
    console.log("task display page")
    console.log(tasks)
    set_taskHtml();
    all_task_filter.addEventListener('change',set_taskHtml);
    console.log(see_detail_btn);
    for(let i =0; i < see_detail_btn.length; i++){
        see_detail_btn[i].addEventListener("click",open_details)
    }
    for(let i =0; i < delete_btn.length; i++){
        delete_btn[i].addEventListener("click",Delete_task)
    }
    for(let i =0; i < complete_btn.length; i++){
        complete_btn[i].addEventListener("click",complete_task)
    }
    
}

function complete_task(){
    let out = confirm("Have you finished the task completely?");
    let completed_task = String(this.parentElement.parentElement.children[0].innerHTML);
    let completed_task_focus = tasks.filter((x) => x.name == completed_task)[0];
    if(out){
        
        completeTask(completed_task_focus.id);

    }

}

function Delete_task(){
    let task_tobe_deleted_name = String(this.parentElement.parentElement.children[0].innerHTML);
    let task_tobe_deleted = tasks.filter((x) => x.name == task_tobe_deleted_name)[0];
    let out = confirm(`Are you sure you wish to proceed and delete task: "${task_tobe_deleted.name}"`);
    console.log(`${task_tobe_deleted.id}`);
    if (out){
        console.log("Deleted");
        deleteTask(task_tobe_deleted.id);


    } else {
        console.log("Canceled");
    }

}

function task_edit_page(){
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params) {
        itemId = value;
    }
    console.log(itemId);
    
    focused_task = tasks.filter((x) => x.id == itemId)[0];

    console.log(`${focused_task.last_completed.getFullYear()}-${focused_task.last_completed.getMonth()+1}-${focused_task.last_completed.getDate()}`);

    let month = String(focused_task.last_completed.getMonth()+1).padStart(2, '0');
    Detailed_task_display.innerHTML =`<label for="task_name">Task Name: </label>
                                        <input type="text" id="task_name" name="tname" value="${focused_task.name}"><br><br>
                                        <label for="task_desc" >Task Description:</label><br>
                                        <textarea id="task_desc" name="tdesc" autocomplete="off" rows="6" cols="80">${focused_task.task_desc}</textarea>
                                        <br><br>
                                        <label for="task_start">Last Completed:</label>
                                        <input type="date" id="task_start" value="${focused_task.last_completed.getFullYear()}-${month}-${focused_task.last_completed.getDate()}" name="task_start">
                                        <br><br>
                                        <label for="task_repeat">How many weeks between:</label>
                                        <input type="number" id="task_repeat" name="task_repeat" value ="${focused_task.repeat}" min="1" max="100">`;
    
    document.getElementById("submit_task_changes").addEventListener("click",update_task);

    document.getElementById("cancel_task_changes").addEventListener("click",cancel_task_changes);
}












