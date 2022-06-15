import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

import Task from './task.js';

const deskSchema = new Schema({
  settings: {
    title: {
      type: String,
      default: 'TODO Desk'
    },
    private: {
      type: Boolean,
      default: true
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  users: {
    admins: [
      {
        type: ObjectId,
        ref: 'User'
      }
    ],
    users: [
      {
        type: ObjectId,
        ref: 'User'
      }
    ],
    viewers: [
      {
        type: ObjectId,
        ref: 'User'
      }
    ]
  },
  tasks: [
    {
      type: ObjectId,
      ref: 'Task'
    }
  ]
});

deskSchema.methods = {
  async addTask(task) {
    return new Promise(async res => {
      await this.populate('tasks', 'metadata');
      let order =
        this.tasks.length
          ? task.metadata.important
            ? this.tasks.findIndex(el => !el.metadata.important || el.metadata.done)
            : this.tasks.findIndex(el => el.metadata.done)
          : 0;
      if (order === -1) order = this.tasks.length;

      this.tasks.splice(order, 0, task);
      await this.save();
      res(order);
    });
  },
  async doneTask(taskID, done) {
    return new Promise(async res => {
      await this.populate('tasks');
      const taskIndex = this.tasks.findIndex(task => task._id == taskID);
      if (taskIndex === -1) return res(-1);

      let order =
        done
          ? this.tasks.findIndex(task => task.metadata.done) - 1
          : this.tasks[taskIndex].metadata.important
            ? 0
            : this.tasks.findIndex(task => !task.metadata.important || task.metadata.done);
      if (order === -2) order = this.tasks.length - 1;

      const task = this.tasks.splice(taskIndex, 1)[0];
      this.tasks.splice(order, 0, task);
      await Task.findByIdAndUpdate(taskID, { $set: { "metadata.done": done}});
      await this.save();
      res(order);
    });
  }
};

export default model('Desk', deskSchema);
