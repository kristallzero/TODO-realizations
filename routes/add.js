import { Router } from "express";
import Task from "../models/task.js";

const router = Router();

router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();

    const user = await req.user.populate('desk');
    const { order, save } = user.addTask(task);
    await save;
    res.json({id: task._id, order});
  } catch (e) {
    console.log(e);
    res.status(500).end(e);
  }
});

export default router;