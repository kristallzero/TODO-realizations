// User name init
const user_id = 'kristi#0000';
const user_name = user_id.slice(0, user_id.indexOf('#'));
document.querySelector('.name').innerText = user_id;

// Task input
const add_btn = document.getElementById('add-btn');
const task_input = document.getElementById('task-input');
const task_input_multi = document.getElementById('task-input-multi');
const properties = {
  multi: document.getElementById('multi'),
  important: document.getElementById('important'),
  private: document.getElementById('private')
};

// Tasks
const task_board = document.getElementById('tasks');

// Tasks loading
fetch('/pages/kristi_0000.json').then(res => res.ok ? res.json() : Promise.reject())
  .then((data) => showTasks(data))
  .catch(() => task_board.innerHTML = '<h1>Opss... Server Error! Please, reload page!</h1>');

// Load tasks to the board
function showTasks(data) {
  const important = [];
  const usual = [];
  const done = [];
  for (const i of data) {
    if (i.metadata.done) done.push(i);
    else if (i.metadata.important) important.push(i);
    else usual.push(i);
  }
  [].concat(important, usual, done).reverse().forEach(i => {
    if (i.metadata.multi) {
      add_task(i.data.title, i.data.subtasks, i.metadata.date, i.metadata.author, i.metadata.private, i.metadata.important);
    } else {
      add_task(i.data, false, i.metadata.date, i.metadata.author, i.metadata.private, i.metadata.important);
    }
  });
}

//* Events
add_btn.addEventListener('click', new_task);
task_input.parentElement.addEventListener('keypress', e => { if (e.key === 'Enter') new_task() });

//* Creating new task
function new_task() {
  const date = new Date();
  const task = {
    metadata: {
      author: user_name,
      multi: false, //TODO multi
      important: properties.important.checked,
      private: properties.private.checked,
      done: false,
      date: [date.getDate(), date.getMonth() + 1, date.getFullYear()].join('/'),
      id: "new"
    },
    data: task_input.value //TODO multi
  }
  add_task(task.data, task.multi,
    task.metadata.date, task.metadata.author,
    task.metadata.private, task.metadata.important);
  //TODO Send add task
  // fetch('/pages/kristi_0000.json', { method: 'POST', body: {task: task, type: 'add'}});
}

//* Loading new task
function add_task(task_value, multi, date, user, private, important) {
  if (task_value) { // If task text is not empty
    const task = document.createElement('li');
    // Creating task_text block
    const task_text = document.createElement('div');
    task_text.classList.add('task-text');
    // Adding checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('click', () => checkboxEvent(checkbox, task));
    if (typeof multi !== 'object') {
      task_text.innerText = task_value;
      task_text.prepend(checkbox);
    } else { // Adding multi task text
      task.classList.add('multi');
      // Adding multi task title
      const task_title = document.createElement('div');
      task_title.classList.add('title');
      task_title.innerText = task_value;
      task_title.prepend(checkbox);
      task_text.appendChild(task_title);
      // Creating subtasks
      const subtasks = document.createElement('ul');
      subtasks.classList.add('subtasks');
      for (const i of multi) {
        const subtask = document.createElement('li');
        subtask.innerText = i.data;
        const subCheckbox = document.createElement('input');
        subCheckbox.type = 'checkbox';
        subCheckbox.addEventListener('click', () => subtaskCheckboxEvent(subCheckbox, subtask));
        if (i.done) {
          subtask.classList.add('done');
          subCheckbox.checked = true;
        }
        subtask.prepend(subCheckbox);
        subtasks.appendChild(subtask);
      }
      task_text.appendChild(subtasks);
    }
    task.appendChild(task_text);
    // Adding task data
    const task_data = document.createElement('div');
    task_data.classList.add('data');
    task_data.innerHTML = `${date}<br>${user}`;
    if (private) task_data.innerHTML += ' (private)';
    task.appendChild(task_data);
    // Adding delete button
    const del_btn = document.createElement('input');
    del_btn.type = 'button';
    del_btn.classList.add('delete');
    del_btn.addEventListener('click', () => {
      task_board.removeChild(task);
      //TODO Add delete task for server
      // fetch('/pages/kristi_0000.json', { method: 'POST', body: {task: task, type: 'delete'}});
    });
    task.appendChild(del_btn);
    if (important) { // Adding imp backgr and prepending to the desk
      task.classList.add('important');
      task_board.prepend(task);
    } else { // Finding first usual task and inserting before that
      let firstUsual;
      for (firstUsual of task_board.children) if (!firstUsual.className.includes('important')) break;
      task_board.insertBefore(task, firstUsual);
    }
  }
}

//* Adding checkbox event to usual task
function checkboxEvent(checkbox, task) {
  // Changing substasks checkboxes
  if (task.className.includes('multi')) for (const i of task.children[0].children[1].children) i.children[0].checked = i.className === 'done' ? true : checkbox.checked;

  task_board.removeChild(task);
  if (checkbox.checked) {
    task.classList.add('done');
    task_board.appendChild(task);
  } else {
    task.classList.remove('done');
    if (task.className.includes('important')) task_board.prepend(task);
    else {
      // Finding first usual task and insert before that
      let firstUsual;
      for (firstUsual of task_board.children) if (!(firstUsual.className.includes('important') && firstUsual.className.includes('done'))) break;
      task_board.insertBefore(task, firstUsual);
    }
  }
}

//* Adding checkbox event to subtask
function subtaskCheckboxEvent(checkbox, subtask) {
  const subtasks = subtask.parentElement;
  let fullDone;
  if (checkbox.checked) {
    subtask.classList.add('done'); // Moving subtask to bottom 
    subtasks.removeChild(subtask);
    subtasks.appendChild(subtask);
    fullDone = Array.from(subtasks.children).every(i => i.className.includes('done')); // Checking if all subtasks are done
  } else {
    subtask.classList.remove('done'); // Moving subtask to up
    subtasks.removeChild(subtask);
    subtasks.prepend(subtask);
    fullDone = subtasks.parentElement.parentElement.className.includes('done'); // Checking before deleting done class
  }
  if (fullDone) {
    const TitleCheckbox = subtasks.previousElementSibling.children[0];
    TitleCheckbox.checked = checkbox.checked; // Setting title checkbox like this checkbox
    checkboxEvent(TitleCheckbox, subtasks.parentElement.parentElement); // Doing checkbox event
  }
}
