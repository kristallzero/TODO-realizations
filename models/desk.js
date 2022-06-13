import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

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

export default model('Desk', deskSchema);
