import { Router } from "express";

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
      
      res.render('desk', { username, desk: await Desk.findById(desk._id).lean() });
    } else {
      const desk = await Desk.findById(desks.splice(0, 1)).populate('tasks').lean();
  
      await user.populate({ path: 'desks', select: 'users settings', options: {lean: true} });
      res.render('desk', {username, desk, desks});
    }
  } catch (e) {
    console.log(e);
    res.status(500).send('Server error');
  }
});

router.get('/:deskID', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/auth');
  const user = await req.user.populate('desks').select('username desks');
  const { username, desks } = user;

  if (!desks) return res.redirect('/');

  const desk = await Desk.findById(desks.splice(desks.findIndex(desk => desk._id == req.params.deskID), 1)).populate('tasks').lean();
  await user.populate({ path: 'desks', select: 'settings users', options: { lean: true } });

  res.render('desk', { username, desk, desks });
});

router.post('/:deskID', async (req, res) => {
  try {
    if (!req.session.authenticated) return res.redirect('/auth');
    const desk = await Desk.findById(req.params.deskID).populate('tasks');
    if (!(desk.users.includes(req.userID)))
      console.log(desk);
  } catch (e) {
    console.log(e);
    res.status(500).send('Server error');
  }
});


export default router;
