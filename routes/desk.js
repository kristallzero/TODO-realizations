import { Router } from "express";

import Desk from '../models/desk.js';
import task from '../models/task.js';

const router = Router();

router.get('/:deskID', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/auth');
  const user = await req.user.populate('desks').select('username desks');
  const { username, desks } = user;

  const desk = await Desk.findById(desks.splice(desks.findIndex(desk => desk._id == req.params.deskID), 1)).populate('tasks').lean();

  await user.populate({ path: 'desks', select: 'settings users', options: { lean: true } });

  res.render('desk', { username, desk, desks });
});

export default router;
