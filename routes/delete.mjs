import { Router } from "express";
import { deleteTask } from "../models/desk.mjs";

export const router = Router();

router.delete('/:order', async(req, res) => {
  try {
    await deleteTask(req.params.order);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});