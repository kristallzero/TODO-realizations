import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const {ObjectId} = Schema.Types;

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

export default model('Task', taskSchema);