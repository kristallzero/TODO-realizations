// Input
const add_btn = document.getElementById('add-btn');
const task_input = document.getElementById('task-input');
const properties = {
    multi: document.getElementById('multi'),
    important: document.getElementById('important'),
    private: document.getElementById('private')
};

// Tasks loading
fetch('/pages/tasks.json').then(res => res.ok ? res.json(): Promise.reject()).then(text => showTasks(text)).catch(() => console.error('Opps...Server Error!'));

function showTasks(data) {
    console.log(data);    
    tasks = data;
}

// Tasks
const task_board = document.getElementById('tasks');
const checkboxes = task_board.querySelectorAll('input[type="checkbox"]');
var tasks;
// Events
add_btn.addEventListener('click', () => {
    console.log(task_input.value);
    console.log(checkboxes);
});

for(const i of checkboxes) {
    i.addEventListener('click', () => {
        console.log('checked');
        console.log('test')
    });
}


