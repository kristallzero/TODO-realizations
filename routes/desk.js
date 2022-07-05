import { Router } from "express";

import mongoose from 'mongoose';

import Desk from '../models/desk.js';
import Task from '../models/task.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.redirect('/auth');
    const user = await req.user.select('username desks');
    const { username, desks } = user;

    if (!desks.length) {
      const desk = new Desk({
        users: {
          admins: [user._id]
        }
      });
      await desk.save();
      desks.push(desk._id);
      await user.save();

      res.render('desk', { username, desk: await Desk.findById(desk._id).lean(), admin: true });
    } else {
      const desk = await Desk.findById(desks.splice(0, 1)).populate('tasks').lean();

      await user.populate({ path: 'desks', select: 'settings', options: { lean: true } });
      res.render('desk', { username, desk, desks, admin: true });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send('Server error');
  }
});

router.get('/:deskID', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.redirect('/auth');
    const desk = await Desk.findById(req.params.deskID).populate('tasks').lean();
    if (!desk) return res.redirect('/');
    let admin, user, viewer;
    if (desk.users.admins.find(id => id == req.session.userID)) admin = true;
    else if (desk.users.users.find(id => id == req.session.userID)) user = true;
    else if (!desk.users.viewers.find(id => id == req.session.userID) && desk.settings.private) return res.redirect('/');
    else viewer = true;

    const currentUser = await req.user.select('username desks');
    const { username, desks } = currentUser;

    const deskIndex = desks.findIndex(desk => desk == req.params.deskID);
    if (deskIndex !== -1) desks.splice(deskIndex, 1);

    await currentUser.populate({ path: 'desks', select: 'settings', options: { lean: true } });
    res.render('desk', { username, desk, desks, admin, user, viewer });
  } catch (e) {
    console.log(e);
    res.status(500).send('Server error');
  }
});

router.post('/:deskID/create', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.status(401).send({ error: 'Unauthorized' });
    if (!mongoose.isValidObjectId(req.params.deskID)) return res.status(400).send({ error: 'Wrong ID syntax' });

    const desk = await Desk.findById(req.params.deskID);
    if (!desk) return res.status(404).send({ error: 'Desk Not Found' });
    if (!desk.settings.editable) return res.status(403).send({ error: 'The desk is not editable' });
    if (!(desk.users.admins.includes(req.session.userID) || desk.users.users.includes(req.session.userID)))
      return res.status(403).send({ error: 'You have not a permission to create a task' });

    const { multi, important, title } = req.body;
    const subtasks = req.body.subtasks?.map(subtask => ({ data: subtask }));
    const { username } = await req.user;


    const task = new Task({
      metadata: {
        author: {
          username,
          id: req.session.userID
        },
        multi,
        private: req.body.private,
        important
      },
      data: {
        title,
        subtasks: subtasks || []
      }
    });
    await task.save();
    const order = await desk.addTask(task);

    res.send({ id: task._id, subIDs: task.data.subtasks.map(subtask => subtask._id), order });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server error' });
  }
});

router.delete('/:deskID/task', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.status(401).send({ error: 'Unauthorized' });
    if (!(mongoose.isValidObjectId(req.params.deskID) || (mongoose.isValidObjectId(req.query.taskID))))
      return res.status(400).send({ error: 'Wrong ID syntax' });

    const desk = await Desk.findById(req.params.deskID);
    if (!desk) return res.status(404).send({ error: 'Desk Not Found' });
    if (!desk.settings.editable) return res.status(403).send({ error: 'The desk is not editable' });
    if (!(desk.users.admins.includes(req.session.userID) || desk.users.users.includes(req.session.userID)))
      return res.status(403).send({ error: 'You have not a permission to delete a task' });

    const taskIndex = desk.tasks.findIndex(task => task._id == req.query.taskID);
    if (taskIndex === -1) return res.status(404).send({ error: 'Task Not Found' });
    desk.tasks.splice(taskIndex, 1);
    await desk.save();

    await Task.findByIdAndDelete(req.query.taskID);

    res.status(200).end();
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server error' });
  }
});

router.patch('/:deskID/task', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.status(401).send({ error: 'Unauthorized' });
    if (!(mongoose.isValidObjectId(req.params.deskID) || (mongoose.isValidObjectId(req.query.taskID))))
      return res.status(400).send({ error: 'Wrong ID syntax' });

    const desk = await Desk.findById(req.params.deskID);
    if (!desk) return res.status(404).send({ error: 'Desk Not Found' });
    if (!desk.settings.editable) return res.status(403).send({ error: 'The desk is not editable' })
    if (!(desk.users.admins.includes(req.session.userID) || desk.users.users.includes(req.session.userID)))
      return res.status(403).send({ error: 'You have not a permission for editting tasks' });

    const newOrder = await desk.doneTask(req.query.taskID, req.body.done);
    if (newOrder === -1) return res.status(404).send({ error: 'Task Not Found' });

    res.send({ newOrder });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server error' });
  }
});

router.patch('/:deskID/subtask', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.status(401).send({ error: 'Unauthorized' });
    if (!(mongoose.isValidObjectId(req.params.deskID) || mongoose.isValidObjectId(req.query.taskID) || mongoose.isValidObjectId(req.query.subtaskID)))
      return res.status(400).send({ error: 'Wrong ID syntax' });
    const desk = await Desk.findById(req.params.deskID);
    if (!desk) return res.status(404).send({ error: 'Desk Not Found' });
    if (!desk.settings.editable) return res.status(403).send({ error: 'The desk is not editable' })
    if (!(desk.users.admins.includes(req.session.userID) || desk.users.users.includes(req.session.userID)))
      return res.status(403).send({ error: 'You have not a permission for editting tasks' });

    const task = await Task.findById(desk.tasks.find(task => task == req.query.taskID));
    if (!task) return res.status(404).send({ error: 'Task Not Found' })

    const newOrder = await task.doneSubtask(req.query.subtaskID, req.body.done);
    if (newOrder === -1) return res.status(404).send({ error: 'Subtask Not Found' });

    res.send({ newOrder });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server error' });
  }
});

router.delete('/:deskID', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.status(401).send({ error: 'Unauthorized' });
    if (!mongoose.isValidObjectId(req.params.deskID)) return res.status(400).send({ error: 'Wrong ID syntax' });

    const desk = await Desk.findById(req.params.deskID);
    if (!desk) return res.status(404).send({ error: 'Desk Not Found' });
    if (!desk.users.admins.includes(req.session.userID)) return res.status(403).send({ error: 'You are not an admin' });

    await req.user.updateOne({ '$pull': { 'desks': mongoose.Types.ObjectId(req.params.deskID) } });
    await Desk.findByIdAndDelete(req.params.deskID);
    res.status(200).send({});
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server error' });
  }
});

router.post('/new', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.status(401).send({ error: 'Unauthorized' });

    const { title } = req.query;
    if (!title) return res.status(400).send({ error: 'Wrong request syntax' });
    if (title.length > 20) return res.status(400).send({ error: 'Too long title' });

    const desk = new Desk({
      settings: { title },
      users: {
        admins: [req.session.userID]
      }
    });
    await desk.save();
    await req.user.updateOne({ '$push': { 'desks': desk } });

    res.status(200).send({ id: desk._id });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server Error' });
  }
});

router.patch('/:deskID/title', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.status(401).send({ error: 'Unauthorized' });
    if (!mongoose.isValidObjectId(req.params.deskID)) return res.status(400).send({ error: 'Wrong ID syntax' });

    const title = req.query.value;
    if (!title) return res.status(400).send({ error: 'Wrong request syntax' });
    if (title > 20) return res.status(400).send({ error: 'Too long title' });

    const desk = await Desk.findById(req.params.deskID);
    if (!desk) return res.status(404).send({ error: 'Desk Not Found' });
    if (!desk.users.admins.includes(req.session.userID)) return res.status(403).send({ error: 'You are not an admin' });

    await desk.updateOne({ 'settings.title': req.query.value });

    res.status(200).send({});
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server Error' });
  }
});

router.patch('/:deskID/private', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.status(401).send({ error: 'Unauthorized' });
    if (!mongoose.isValidObjectId(req.params.deskID)) return res.status(400).send({ error: 'Wrong ID syntax' });

    const { value } = req.query;
    if (!value) return res.status(400).send({ error: 'Wrong request syntax' });

    const desk = await Desk.findById(req.params.deskID);
    if (!desk) return res.status(404).send({ error: 'Desk Not Found' });
    if (!desk.users.admins.includes(req.session.userID)) return res.status(403).send({ error: 'You are not an admin' });

    await desk.updateOne({ 'settings.private': value === 'true' });

    res.status(200).send({});
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server Error' });
  }
});

router.patch('/:deskID/editable', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.status(401).send({ error: 'Unauthorized' });
    if (!mongoose.isValidObjectId(req.params.deskID)) return res.status(400).send({ error: 'Wrong ID syntax' });

    const { value } = req.query;
    if (!value) return res.status(400).send({ error: 'Wrong request syntax' });

    const desk = await Desk.findById(req.params.deskID);
    if (!desk) return res.status(404).send({ error: 'Desk Not Found' });
    if (!desk.users.admins.includes(req.session.userID)) return res.status(403).send({ error: 'You are not an admin' });

    await desk.updateOne({ 'settings.editable': value === 'true' });

    res.status(200).send({});
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server Error' });
  }
});

export default router;
