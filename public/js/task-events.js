for (let i = 0; i < task_board.children.length; i++) {
  const task = task_board.children[i];
  task.onclick = e => taskEventsRouter(e, task, task.querySelector('.delete').previousElementSibling.value);
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
      if (input.classList.contains('edit-task')) editHandler(task, id);
      else deleteHandler(task, id);
  }
}

function checkboxHandler(checkbox, task, id) {
  fetch(`desks/${deskId}/task?taskID=${id}`, { method: 'PATCH', body: JSON.stringify({ done: checkbox.checked }), headers: { 'content-type': 'application/json', 'X-XSRF-TOKEN': csrf } })
    .then(res => res.json())
    .then(({ newOrder, error }) => {
      if (error) throw new Error(error);
      if (task.classList.contains('multi'))
        Array.from(task.querySelector('.subtasks').children)
          .forEach(el => el.children[0].checked = el.classList.contains('done') || checkbox.checked);

      task.classList.toggle('done');
      task_board.removeChild(task);
      task_board.insertBefore(task, task_board.children[+newOrder]);
    });
}

function subCheckboxHandler(checkbox, task, subtask, taskId) {
  const subtaskId = subtask.querySelector('.id').value;
  const subtasks = task.querySelector('.subtasks');

  fetch(`desks/${deskId}/subtask?taskID=${taskId}&subtaskID=${subtaskId}`, { method: 'PATCH', body: JSON.stringify({ done: checkbox.checked }), headers: { 'content-type': 'application/json', 'X-XSRF-TOKEN': csrf } })
    .then(res => res.json())
    .then(({ newOrder, error }) => {
      if (error) throw new Error(error);
      if (!checkbox.checked) checkAllSubtasks(subtasks, task, taskId, false);
      subtasks.removeChild(subtask);
      subtasks.insertBefore(subtask, subtasks.children[+newOrder]);
      if (checkbox.checked) {
        subtask.classList.add('done');
        checkAllSubtasks(subtasks, task, taskId, true);
      } else subtask.classList.remove('done');
    });
}

function checkAllSubtasks(subtasks, task, id, checked) {
  if (task.classList.contains('done') || Array.from(subtasks.children).every(el => el.classList.contains('done'))) {
    const checkbox = task.querySelector('input');
    checkbox.checked = checked;
    checkboxHandler(checkbox, task, id);
  }
}

const deleteHandler = (task, id) =>
  fetch(`/desks/${deskId}/task?taskID=${id}`, { method: 'DELETE', headers: { 'X-XSRF-TOKEN': csrf } })
    .then(({ error }) => {
      if (error) throw new Error(error);
      task_board.removeChild(task);
    });


function editHandler(task, id) {
  deleteHandler(task, id);

  if (task.classList.contains('multi')) {
    addTask.taskInput.value = task.querySelector('.title').innerText.slice(1);
    addTask.properties.multi.checked = true;
    addTask.subtasks.classList.remove('hide');

    const subtasks = task.querySelector('.subtasks');
    while (addTask.subtasks.childElementCount < subtasks.childElementCount)
      createSubtaskInput(addTask.subtasks.children[0]);
    for (let i = 0; i < addTask.subtasks.childElementCount; i++)
      addTask.subtasks.children[i].firstElementChild.value = subtasks.children[i].innerText.slice(1);
  } else {
    addTask.taskInput.value = task.querySelector('.task-text').innerText.slice(1);
    addTask.properties.multi.checked = false;
    addTask.subtasks.classList.add('hide');
  }
  addTask.properties.important.checked = task.classList.contains('important');
  addTask.properties.private.checked = task.querySelector('.data').innerText.includes('(private)');

}
