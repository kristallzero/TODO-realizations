import { Router } from "express";
import Task from '../models/task.js';

const router = Router();

router.patch('/:id', async (req, res) => {
  try {
    const done = req.query.done === 'true';
    
    const user = await req.user.populate('desk');
    const { order, save } = user.doneTask(req.params.id, done);
    await save;

    const task = await Task.findById(req.params.id);
    await task.setDone(done);
    
    res.send(String(order));
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.patch('/:id/:subOrder', async (req, res) => {
  try {
    const done = req.query.done === 'true';
    const task = await Task.findById(req.params.id);
    const {order, save} = task.setSubtaskDone(done, req.params.subOrder);
    await save;
    res.send(String(order));
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

export default router;