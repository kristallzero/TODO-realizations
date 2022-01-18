//* Task input
const add_btn = document.getElementById('add-btn');
const task_input = document.getElementById('task-input');
const properties = {
  multi: document.getElementById('multi'),
  important: document.getElementById('important'),
  private: document.getElementById('private')
};

//* Tasks
const task_board = document.getElementById('tasks');

//* Add task events
add_btn.addEventListener('click', newTaskHandler);
task_input.parentElement.addEventListener('keypress', e => { if (e.key === 'Enter') newTaskHandler() });

if (task_board.children.length)
  for (const task of task_board.children) {
    task.querySelector('input').checked = task.classList.contains('done');
    // Subcheckboxes status set
    if (task.classList.contains('multi'))
      for (const subtask of task.querySelector('.subtasks').children)
        subtask.querySelector('input').checked =
          task.classList.contains('done') || subtask.classList.contains('done')
    // Add event router
    task.addEventListener('click', e => taskEventsRouter(e, task));
  }


function newTaskHandler() {
  if (task_input.value) { // If task text is not empty
    document.body.style.cursor = "progress";
    const date = new Date();
    const task = {
      metadata: {
        author: "kristi#0000",
        multi: false, //TODO multi
        important: properties.important.checked,
        private: properties.private.checked,
        done: false,
        date: [date.getDate(), date.getMonth() + 1, date.getFullYear()].join('/'),
      },
      data: task_input.value
    }
    fetch('add', { method: 'POST', body: JSON.stringify(task), headers: { 'content-type': 'application/json' } })
      .then(res => res.ok ? res.text() : Promise.reject()).then((data) => {
        task.metadata.order = +data;
        addTaskHandler(task);
        task_input.value = '';
        document.body.style.cursor = "auto";
      })
    //.catch(() => task_board.innerHTML = `<h1>Oh No... Server Error! Please, reload page!</h1>`);
  }
}

function taskEventsRouter(e, task) {
  const input = e.target;
  switch (input.type) {
    case 'checkbox':
      const parent = input.parentElement;
      if (parent.localName === 'div') checkboxHandler(input, task);
      else subCheckboxHandler(input, task, parent);
      break;
    case 'button':
      deleteHandler(task);
  }
}

function checkboxHandler(checkbox, task) {
  const order = Array.from(task_board.children).findIndex(el => el === task);
  fetch(`/done/${order}?done=${checkbox.checked}`, { method: 'PATCH' })
    .then(res => res.ok ? res.text() : Promise.reject())
    .then(newOrder => {
      // Changing substasks checkboxes
      if (task.classList.contains('multi'))
        Array.from(task.querySelector('.subtasks').children)
          .forEach(el => el.children[0].checked = el.className === 'done' || checkbox.checked);

      task_board.removeChild(task);

      if (checkbox.checked) task.classList.add('done');
      else task.classList.remove('done');

      task_board.insertBefore(task, task_board.children[+newOrder]);
    });
}

function subCheckboxHandler(checkbox, task, subtask) {
  const order = Array.from(task_board.children).findIndex(el => el === task);

  const subTasks = task.querySelector('.subtasks');
  const subOrder = Array.from(subTasks.children).findIndex(el => el === subtask);

  fetch(`/done/${order}/${subOrder}?done=${checkbox.checked}`, { method: 'PATCH' })
    .then(res => res.ok ? res.text() : Promise.reject())
    .then(newOrder => {
      subTasks.removeChild(subtask);

      if (checkbox.checked) subtask.classList.add('done');
      else subtask.classList.remove('done');

      subTasks.insertBefore(subtask, subTasks.children[+newOrder]);

      if (Array.from(subTasks.children).every(el => el.classList.contains('done'))) checkboxHandler(task.querySelector('input', task));
    });
}

function deleteHandler(task) {
  const order = Array.from(task_board.children).findIndex(el => el === task);

  fetch(`/delete/${order}`, { method: 'DELETE' })
    .then(res => res.ok ? task_board.removeChild(task) : Promise.reject);
}

//* Task add
function addTaskHandler(task) {
  const taskElement = document.createElement('li');

  var task_text;
  if (task.metadata.multi) {
    taskElement.classList.add('multi');

    let task_title = `
    <div class="title">
      <input type="checkbox">
      ${task.data.title};
    </div>`;

    let task_subtasks = '<ul class="subtasks">';
    task.data.subtasks.forEach(el => task_subtasks += `
    <li>
      <input type="checkbox">
      ${el.data}
    </li>`);
    task_subtasks += '</li>';

    task_text = `<div class="task-text">${task_title} ${task_subtasks}</div>`;
  } else
    task_text = `<div class="task-text"><input type="checkbox"> ${task.data}</div>`;

  taskElement.innerHTML = `
  ${task_text}
  <div class="data">
    ${task.metadata.date}
    <br>
    ${task.metadata.author}${task.metadata.private ? ' (private)' : ''}
  </div>
  <input type="button" class="delete">
  `;

  taskElement.addEventListener('click', e => taskEventsRouter(e, taskElement));

  if (task.metadata.important) {
    taskElement.classList.add('important');
    task_board.prepend(taskElement);
  } else {
    let firstUsual =
      Array.from(task_board.children)
        .find(el => !el.classList.contains('important'));
    task_board.insertBefore(taskElement, firstUsual);
  }
}