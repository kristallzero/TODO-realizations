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

//* Date formatting
const toDate = date => new Intl.DateTimeFormat('en-UK', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(date));

//* Add task events
add_btn.onclick = newTaskHandler;
task_input.parentElement.onkeyup = e => { if (e.key === 'Enter') newTaskHandler() };

if (task_board.children.length)
  for (let i = 0; i < task_board.children.length; i++) {
    const task = task_board.children[i];
    //Tasks checkboxes status set
    task.querySelector('input').checked = task.classList.contains('done');
    // Subcheckboxes status set
    if (task.classList.contains('multi'))
      for (let j = 0; j < task.querySelector('.subtasks').children.length; j++) {
        const subtask = task.querySelector('.subtasks').children[j];
        subtask.querySelector('input').checked =
          task.classList.contains('done') || subtask.classList.contains('done')
      }
    task.querySelectorAll('.date').forEach(date => date.textContent = toDate(date.textContent));
    // Add event router
    task.onclick = e => taskEventsRouter(e, task, task.querySelector('.id').value);
  }

function newTaskHandler() {
  if (task_input.value.trim()) { // If task text is not empty
    document.body.style.cursor = "progress";
    const task = {
      metadata: {
        author: "kristi#0000",
        multi: false, //TODO multi
        important: properties.important.checked,
        private: properties.private.checked,
      },
      data: { title: task_input.value }
    }
    fetch('add', { method: 'POST', body: JSON.stringify(task), headers: { 'content-type': 'application/json' } })
      .then(res => res.json())
      .then(({ id, order }) => {
        task.metadata.order = order;
        addTaskHandler(task, id);
        task_input.value = '';
        document.body.style.cursor = "auto";
      })
  }
}

function taskEventsRouter(e, task, id) {
  const input = e.target;
  switch (input.type) {
    case 'checkbox':
      const parent = input.parentElement;
      if (parent.localName === 'div') checkboxHandler(input, task, id);
      else subCheckboxHandler(input, task, parent, id);
      break;
    case 'button':
      deleteHandler(task, id);
  }
}

function checkboxHandler(checkbox, task, id) {
  fetch(`/done/${id}?done=${checkbox.checked}`, { method: 'PATCH' })
    .then(res => res.text())
    .then(newOrder => {
      // Changing substasks checkboxes
      if (task.classList.contains('multi'))
        Array.from(task.querySelector('.subtasks').children)
          .forEach(el => el.children[0].checked = el.classList.contains('done') || checkbox.checked);

      task_board.removeChild(task);

      task.classList.toggle('done');
      task_board.insertBefore(task, task_board.children[+newOrder]);
    });
}

function subCheckboxHandler(checkbox, task, subtask, id) {
  const subTasks = task.querySelector('.subtasks');
  const subOrder = Array.from(subTasks.children).findIndex(el => el === subtask);

  fetch(`/done/${id}/${subOrder}?done=${checkbox.checked}`, { method: 'PATCH' })
    .then(res => res.text())
    .then(newOrder => {
      if (!checkbox.checked) checkAllSubtasks(subTasks, task, id, false);
      subTasks.removeChild(subtask);
      subtask.classList.toggle('done');
      console.log(+newOrder);
      subTasks.insertBefore(subtask, subTasks.children[+newOrder]);
      if(checkbox.checked) checkAllSubtasks(subTasks, task, id, true);
    });
}

function checkAllSubtasks(subtasks, task, id, checked) {
  console.log(subtasks.children);
  if (Array.from(subtasks.children).every(el => el.classList.contains('done'))) {
    const checkbox = task.querySelector('input');
    checkbox.checked = checked;
    checkboxHandler(checkbox, task, id);
  }
}

const deleteHandler = (task, id) =>
  fetch(`/delete/${id}`, { method: 'DELETE' })
    .then(() => task_board.removeChild(task));


//* Task add
function addTaskHandler(task, id) {
  const taskElement = document.createElement('li');

  if (task.metadata.important) taskElement.classList.add('important');
  let task_text;
  if (task.metadata.multi) {
    let task_title = `
    <div class="title">
    <input type="checkbox">
    ${task.data.title};
  </div>`;
    taskElement.classList.add('multi');
    let task_subtasks = '<ul class="subtasks">';
    task.data.subtasks.forEach(el => task_subtasks += `
    <li>
      <input type="checkbox">
      ${el.data}
    </li>`);
    task_subtasks += '</li>';

    task_text = `<div class="task-text">${task_title} ${task_subtasks}</div>`;
  } else task_text = `<div class="task-text"><input type="checkbox"> ${task.data.title}</div>`;

  taskElement.innerHTML = `
  ${task_text}
  <div class="data">
    ${toDate(Date.now())}
    <br>
    ${task.metadata.author}${task.metadata.private ? ' (private)' : ''}
  </div>
  <input type="button" class="delete">
  `;

  taskElement.onclick = e => taskEventsRouter(e, taskElement, id);

  task_board.insertBefore(
    taskElement,
    task_board.children[task.metadata.order]
  );
}