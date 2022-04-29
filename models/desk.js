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
            done: Boolean,
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
      task.metadata.important || !this.tasks
        ? 0
        : this.tasks.findIndex(element => !element.metadata.important || element.metadata.done);
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
    const task = this.tasks.splice(taskIndex, 1)[0];
    if (order === -2) order = this.tasks.length;
    this.tasks.splice(order, 0, task);
    task.metadata.done = done;
    return { order, save: this.save() };
  }
}

export default model('Desk', deskSchema);