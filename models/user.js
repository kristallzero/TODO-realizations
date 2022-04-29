import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  user: {
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

userSchema.methods = {
  addDesk: function (desk) {
    this.desks.push(desk);
    return { id: this.desks[this.desks.length - 1], save: this.save() };
  }
};
// userSchema.methods = {
//   addTask: function (task) {
//     let order =
//       task.metadata.important || !this.desk
//         ? 0
//         : this.desk.findIndex(element => !element.metadata.important || element.metadata.done);
//     if (order === -1) order = this.desk.length;

//     this.desk.splice(order, 0, task);
//     return { order, save: this.save() };
//   },
//   deleteTask: function (id) {
//     const taskIndex = this.desk.findIndex(task => task._id.toString() === id);
//     if (taskIndex !== -1) this.desk.splice(taskIndex, 1);
//     return this.save();
//   },
//   doneTask: function (id, done) {
//     const taskIndex = this.desk.findIndex(task => task._id.toString() === id);
//     if (taskIndex === -1) return {};

//     let order =
//       done
//         ? this.desk.findIndex(task => task.metadata.done)
//         : this.desk[taskIndex].metadata.important
//           ? 0
//           : this.desk.findIndex(task => !task.metadata.important || task.metadata.done);

//     const task = this.desk.splice(taskIndex, 1)[0];
//     if (order === -1) order = this.desk.length;
//     this.desk.splice(order, 0, task);
//     return { order, save: this.save() };
//   }
// }

export default model('User', userSchema);