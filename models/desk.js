import mongoose from 'mongoose';
const { Schema, model } = mongoose;

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
  tasks: [
    {
      metadata: {
        author: {
          type: String,
          required: true
        },
        multi: {
          type: Boolean,
          required: true
        },
        private: {
          type: Boolean,
          required: true
        },
        important: {
          type: Boolean,
          required: true
        },
        done: {
          type: Boolean,
          default: false
        },
        date: {
          type: Date,
          default: Date.now
        }
      },
      data: {
        title: {
          type: String,
          required: true
        },
        subtasks: [
          {
            done: {
              type: Boolean,
              default: false
            },
            data: String
          }
        ]
      }
    }
  ]
});

deskSchema.methods = {
  createTask: function (task) {
    let order =
      this.tasks
        ? task.metadata.important
          ? this.tasks.findIndex(el => !el.metadata.important || el.metadata.done)
          : this.tasks.findIndex(el => el.metadata.done)
        : 0;
    if (order === -1) order = this.tasks.length;

    this.tasks.splice(order, 0, task);
    return { order, id: this.tasks[order]._id, save: this.save() };
  },
  setDone: function (id, done) {
    const taskIndex = this.tasks.findIndex(task => task._id.toString() === id);
    if (taskIndex === -1) return;

    let order =
      done
        ? this.tasks.findIndex(task => task.metadata.done) - 1
        : this.tasks[taskIndex].metadata.important
          ? 0
          : this.tasks.findIndex(task => !task.metadata.important || task.metadata.done);
    if (order === -2) order = this.tasks.length;

    const task = this.tasks.splice(taskIndex, 1)[0];
    this.tasks.splice(order, 0, task);
    task.metadata.done = done;
    return { order, save: this.save() };
  },
  setSubDone: function (taskId, subtaskId, done) {
    const task = this.tasks.find(task => task._id.toString() === taskId);
    if (!task) return;

    const subtaskIndex = task.data.subtasks.findIndex(subtask => subtask._id.toString() === subtaskId);
    if (subtaskIndex === -1) return;

    let order =
      done
        ? task.data.subtasks.length - 1
        : 0;

    const subtask = task.data.subtasks.splice(subtaskIndex, 1)[0];
    task.data.subtasks.splice(order, 0, subtask);
    subtask.done = done;
    return { order, save: this.save() };
  }
}

export default model('Desk', deskSchema);