import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const taskSchema = new Schema(
  {
    metadata: {
      author: {
        username: {
          type: String,
          required: true
        },
        id: {
          type: ObjectId,
          ref: 'User',
          required: true
        }
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
);

taskSchema.methods = {
  doneSubtask(subtaskID, done) {
    return new Promise(async res => {
      const { subtasks } = this.data;
      const subtaskIndex = this.data.subtasks.findIndex(subtask => subtask._id == subtaskID);
      if (subtaskIndex == -1) return res(-1);

      let order =
        done
          ? subtasks.length - 1
          : 0;

      const subtask = subtasks.splice(subtaskIndex, 1)[0];
      subtasks.splice(order, 0, subtask);
      subtask.done = done;
      await this.save();

      res(order);
    });
  }
}
export default model('Task', taskSchema);