import Desk from '../models/desk.js';
import User from '../models/user.js';
import Task from '../models/task.js';

export default async function(req, res, next) {
  req.user = User.findOne();
  req.session.authenticated = true;

  next();
}