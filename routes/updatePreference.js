import { Router } from "express";
import Desk from "../models/desk.js";

const router = Router();

router.post('/title/:id', async (req, res) => {
  if (req.query.title.length > 20) return res.status(400);
  try {
    const user = await req.user.populate('desks');
    const desk = user.desks.find(desk => desk._id == req.params.id);
    if (!desk) return res.status(404).end('Desk not found');
    desk.settings.title = req.query.title;
    await desk.save();
    res.end();
  } catch (e) {
    res.status(500).end('Sorry! Server Error! We will fix it soon');
  }
});

router.post('/:preference/:id', async (req, res) => {
  try {
    const user = await req.user.populate('desks');
    const desk = user.desks.find(desk => desk._id == req.params.id);
    if (!desk) return res.status(404).end('Desk not found');
    if (req.params.preference === 'private-desk')
      desk.settings.private = req.query.checked === 'true';
    else
      desk.settings.editable = req.query.checked === 'true';
    await desk.save();
    res.end();
  } catch (e) {
    console.log(e);
    res.status(500).end('Sorry! Server Error! We will fix it soon');
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const user = await req.user.populate('desks');
    const deskIndex = user.desks.findIndex(desk => desk._id == req.params.id);
    if (deskIndex === -1) return res.status(404).end('Desk not found');
    user.desks.splice(deskIndex, 1);
    await user.save();
    await Desk.findByIdAndDelete(req.params.id);
    res.end();
  } catch (e) {
    console.log(e);
    res.status(500).end('Sorry! Server Error! We will fix it soon');
  }
});


export default router;