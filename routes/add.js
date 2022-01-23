import { Router } from "express";

import { put } from "../models/desk.js";

export const router = Router();

router.post('/', async (req, res) => {
  try {
    res.send(await put(req.body));
  } catch (e) {
    console.log(e);
    res.status(500).end(e);
  }
});

export default router;