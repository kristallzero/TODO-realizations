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
      data: { title: addTask.taskInput.value }
    };
    if (addTask.properties.multi.checked) getSubtasks(task);
    fetch(`/${deskId}`, { method: 'POST', body: JSON.stringify(task), headers: { 'content-type': 'application/json' } })
      .then(res => res.json())
      .then(({ id, order }) => {
        task.metadata.order = order;
        addTaskHandler(task, id);
        addTask.taskInput.value = '';
        document.body.style.cursor = "auto";
      });
  }
}
