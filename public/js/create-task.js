"use strict"

addTask.addBtn.onclick = newTaskHandler;
addTask.taskInput.parentElement.onkeyup = e => { if (e.key === 'Enter') newTaskHandler() };

function newTaskHandler() {
  if (addTask.taskInput.value.trim()) {
    document.body.style.cursor = "progress";
    const body = {
      multi: addTask.properties.multi.checked,
      important: addTask.properties.important.checked,
      private: addTask.properties.private.checked,
      title: addTask.taskInput.value
    };
    if (addTask.properties.multi.checked) getSubtasks(body);
    fetch(`/desks/${deskId}/create`, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'X-XSRF-TOKEN': csrf } })
      .then(res => res.json())
      .then(({ id, order, error, subIDs }) => {
        if (error) throw new Error(error);
        body.order = order;
        addTaskHandler(body, id, subIDs);
        addTask.taskInput.value = '';
        document.body.style.cursor = "auto";
      });
  }
}

function addTaskHandler(task, id, subIDs) {
  const taskElement = document.createElement('li');

  if (task.important) taskElement.classList.add('important');
  let task_text;
  if (task.multi) {
    let task_title = `
    <div class="title">
      <input type="checkbox">
      ${task.title}
    </div>`;
    taskElement.classList.add('multi');
    let task_subtasks = '<ul class="subtasks">';
    task.subtasks.forEach((el, i) => task_subtasks += `
    <li>
      <input type="checkbox">
      ${el}
      <input type="hidden" class="id" value="${subIDs[i]}">
    </li>`);
    task_subtasks += '</ul>';

    task_text = `<div class="task-text">${task_title} ${task_subtasks}</div>`;
  } else task_text = `<div class="task-text"><input type="checkbox"> ${task.title}</div>`;

  taskElement.innerHTML = `
  ${task_text}
  <div class="data">
    ${toDate(Date.now())}
    <br>
    ${username}${task.private ? ' (private)' : ''}
    <input type="button" class="edit-task" value="edit">
  </div>
  <input type="button" class="delete">
  `;

  taskElement.onclick = e => taskEventsRouter(e, taskElement, id);

  task_board.insertBefore(
    taskElement,
    task_board.children[task.order]
  );
}