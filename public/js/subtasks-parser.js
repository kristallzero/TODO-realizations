"use strict";

if (addTask.properties.multi.checked) addTask.subtasks.classList.remove('hide');

addTask.properties.multi.onclick = () => {
  if (addTask.properties.multi.checked) addTask.subtasks.classList.remove('hide');
  else addTask.subtasks.classList.add('hide');
}

for (let i = 0; i < addTask.subtasks.children.length; i++) {
  const subtask = addTask.subtasks.children[i];
  subtask.onkeyup = (e) => subtaskInputHandler(subtask, e);
}

function createSubtaskInput(subtask) {
  const newSubtask = document.createElement('li')
  const newSubtaskInput = document.createElement('input');
  newSubtaskInput.type = 'text';
  newSubtaskInput.classList.add('subtask__input');
  newSubtask.appendChild(newSubtaskInput);
  newSubtask.onkeyup = (e) => subtaskInputHandler(newSubtask, e);
  subtask.after(newSubtask);
  newSubtaskInput.focus();
}

function subtaskInputHandler(subtask, e) {
  if (subtask.firstElementChild.value.trim()) {
    if (e.key === 'Enter') createSubtaskInput(subtask);
    else if (e.key === 'ArrowUp') subtask.previousElementSibling?.firstElementChild.focus();
    else if (e.key === 'ArrowDown') subtask.nextElementSibling?.firstElementChild.focus();
  } else if (addTask.subtasks.childElementCount > 1) {
    if (e.key === 'Backspace' || e.key === 'Enter') {
      if (subtask.previousElementSibling) subtask.previousElementSibling.firstElementChild.focus();
      else subtask.nextElementSibling.firstElementChild.focus();
    }
    else if (e.key === 'ArrowUp') {
      subtask.previousElementSibling?.firstElementChild.focus();
    }
    else if (e.key === 'ArrowDown') {
      subtask.nextElementSibling?.firstElementChild.focus();
    }
    addTask.subtasks.removeChild(subtask);
  }
}

function getSubtasks(task) {
  task.subtasks = [];
  const subtasksCount = addTask.subtasks.children.length;
  for (let i = 1; i <= subtasksCount; i++) {
    if (addTask.subtasks.children[0].firstElementChild.value.trim())
      task.subtasks.push(addTask.subtasks.children[0].firstElementChild.value);
    if (addTask.subtasks.childElementCount > 1) addTask.subtasks.removeChild(addTask.subtasks.children[0]);
    else addTask.subtasks.children[0].firstElementChild.value = '';
  }
}
