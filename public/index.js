"use strict"
//* Task input
const input_block = document.querySelector('.add-task');
const deskId = input_block.querySelector('.id').value;

const addTask = {
  addBtn: document.getElementById('add-btn'),
  taskInput: document.getElementById('task-input'),
  properties: {
    multi: document.getElementById('multi'),
    important: document.getElementById('important'),
    private: document.getElementById('private')
  }
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
addTask.addBtn.onclick = newTaskHandler;
addTask.taskInput.parentElement.onkeyup = e => { if (e.key === 'Enter') newTaskHandler() };

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
  if (addTask.taskInput.value.trim()) { // If task text is not empty
    document.body.style.cursor = "progress";
    const task = {
      metadata: {
        author: "kristi#0000",
        multi: false, //TODO multi
        important: addTask.properties.important.checked,
        private: addTask.properties.private.checked,
      },
      data: { title: addTask.taskInput.value }
    }
    fetch(`add/${deskId}`, { method: 'POST', body: JSON.stringify(task), headers: { 'content-type': 'application/json' } })
      .then(res => res.json())
      .then(({ id, order }) => {
        task.metadata.order = order;
        addTaskHandler(task, id);
        addTask.taskInput.value = '';
        document.body.style.cursor = "auto";
      });
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
  fetch(`/done/${deskId}/${id}?done=${checkbox.checked}`, { method: 'PATCH' })
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

  fetch(`/done/${deskId}/${id}/${subOrder}?done=${checkbox.checked}`, { method: 'PATCH' })
    .then(res => res.text())
    .then(newOrder => {
      if (!checkbox.checked) checkAllSubtasks(subTasks, task, id, false);
      subTasks.removeChild(subtask);
      subtask.classList.toggle('done');
      subTasks.insertBefore(subtask, subTasks.children[+newOrder]);
      if (checkbox.checked) checkAllSubtasks(subTasks, task, id, true);
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
  fetch(`/delete/${deskId}/${id}`, { method: 'DELETE' })
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

//*Settings
const settings = document.querySelector('.settings');

const editableDesk = () => settings.querySelector('#editable-desk input').checked;
settings.querySelector('#private-desk input').checked = document.querySelector('.desk-type').textContent === '(private)';

function changeEditable() {
  Array
    .from(task_board.children)
    .forEach(el => {
      const inputs = el.querySelectorAll('input:not(.id)');
      if (editableDesk()) {
        inputs.forEach(input => {
          if (input.classList.contains('delete')) input.type = 'button';
          else input.disabled = false;
        });
        input_block.style.display = '';
      } else {
        inputs.forEach(input => {
          if (input.classList.contains('delete')) input.type = 'hidden';
          else input.disabled = true;
        });
        input_block.style.display = 'none';
      }
    });
}
changeEditable();

let editing = false;
let editingDesk;

document.querySelector('.desk-name').onclick = () => settings.classList.remove('hide');
document.querySelector('.wrapper > .content').onclick = () => settings.classList.add('hide');

settings.querySelector('.desks input').onkeyup = e => {
  if (e.key === 'Enter') addDesk(e.target);
}
document.querySelector('.desks [type="button"]').onclick = () => addDesk(document.querySelector('.desks input'));

function addDesk(input) {
  const deskName = input.value;
  if (deskName.trim().length) {
    if (editing) {
      fetch(`updatePreference/title/${deskId}?title=${deskName}`, { method: 'POST' })
        .then(() => {
          editingDesk.children[0].childNodes[0].textContent = deskName;
          settings.querySelector('.desks > ul').prepend(editingDesk);
          document.querySelector('.desk-name').childNodes[0].textContent = deskName + ' ';
          input.value = '';
        });
    } else {
      fetch(`create?deskTitle=${deskName}`, { method: 'POST' })
        .then(res => res.json())
        .then(({ id }) => {
          const desk = document.createElement('li');
          desk.innerHTML = `<a class="desk" href=${id}>${deskName} (private)</a>`;
          const deleteBtn = document.createElement('input');
          deleteBtn.classList.add('delete-desk');
          deleteBtn.type = 'button';
          deleteBtn.value = 'delete';
          desk.appendChild(deleteBtn);
          settings.querySelector('.desks > ul').appendChild(desk);
          input.value = '';
        });
    }
  }
}

settings.querySelector('.edit-desk').onclick = () => {
  editingDesk = settings.querySelector('.desks li');
  settings.querySelector('.desks ul').removeChild(editingDesk);
  settings.querySelector('.desks input').value = editingDesk.children[0].childNodes[0].textContent;
  editing = true;
};

Array.from(settings.querySelector('.desk-settings').children)
  .forEach(preference => {
    preference.onclick = e => {
      const input = preference.querySelector('input');
      if (e.target !== input) input.checked = !input.checked;
      const { id } = preference;
      const { checked } = input;
      fetch(`/updatePreference/${id}/${deskId}?checked=${checked}`, { method: 'POST' })
        .then(() => {
          if (id === 'private-desk') {
            settings.querySelector('.desks li span').textContent = ` (${checked ? 'private' : 'public'})`;
            document.querySelector('.desk-type').textContent = `(${checked ? 'private' : 'public'})`;
          } else changeEditable();
        });
    }
  });

settings.querySelectorAll('.delete-desk')
  .forEach(el => el.onclick = () => deleteDeskHandler(el.parentElement, el.previousElementSibling.href.split('/').slice(-1)));

settings.querySelector('.delete-desk').onclick = () => location.href = 'http://localhost:3000/';

function deleteDeskHandler(desk, id) {
  fetch(`/updatePreference/delete/${id}`, { method: 'DELETE' })
    .then(() => {
      settings.querySelector('.desks ul').removeChild(desk);
    });
} 