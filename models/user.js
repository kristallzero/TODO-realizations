import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  desks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Desk'
    }
  ]
});

export default model('User', userSchema);
