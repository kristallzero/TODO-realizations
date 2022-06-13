"use strict";

const deskId = input_block.querySelector('.id').value;
const task_board = document.getElementById('tasks');

const input_block = document.querySelector('.js-new-task-block');
const username = document.getElementById('username');

const addTask = {
  addBtn: input_block.getElementById('add-btn'),
  taskInput: input_block.getElementById('task-input'),
  properties: {
    multi: input_block.getElementById('multi'),
    important: input_block.getElementById('important'),
    private: input_block.getElementById('private')
  },
  subtasks: input_block.getElementById('subtasks-input')
};
