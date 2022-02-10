import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const taskSchema = new Schema({
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
});

taskSchema.methods = {
  setDone: function (done) {
    this.metadata.done = done;
    return this.save();
  },
  setSubtaskDone: function (done, subOrder) {
    if (subOrder >= this.data.subtasks.length) return;

    const order =
      done
        ? this.data.subtasks.findIndex(sub => sub.done)
        : 0;
    
    const task = this.data.subtasks.splice(subOrder, 1)[0];
    this.data.subtasks.splice(order, 0, task);
    task.done = done;

    return { order, save: this.save() };
  }
}
export default model('Task', taskSchema);