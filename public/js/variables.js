"use strict";

const input_block = document.getElementById('add-task');

let deskId = document.getElementById('desk-id').value;
const task_board = document.getElementById('tasks');
const settings = document.getElementById('settings');

const username = document.getElementById('username').textContent;

const addTask = {
  addBtn: document.getElementById('add-btn'),
  taskInput: document.getElementById('task-input'),
  properties: {
    multi: document.getElementById('multi'),
    important: document.getElementById('important'),
    private: document.getElementById('private')
  },
  subtasks: document.getElementById('subtasks-input')
};
