import { Router } from "express";
import { done, doneSub } from "../models/desk.js";

export const router = Router();

router.patch('/:order', async (req, res) => {
  try {
    res.send(await done(req.params.order, req.query.done === 'true'));
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.patch('/:order/:subOrder', async (req, res) => {
  try {
    res.send(await doneSub(req.params.order, req.params.subOrder, req.query.done === 'true'))
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

export default router;