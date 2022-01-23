import { Router } from "express";

import { get } from "../models/desk.js";

export const router = Router();


router.get('/', async (req, res) => {
  try {
    res.render('desk', { tasks: await get() });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

export default router;