import { Router } from "express";
import Task from "../models/task.js";

const router = Router();

router.delete('/:id', async(req, res) => {
  try {
    const user = await req.user.populate('desk');
    user.deleteTask(req.params.id);
    
    await Task.deleteOne({_id: req.params.id});
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

export default router;