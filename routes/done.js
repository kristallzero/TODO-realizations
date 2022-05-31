import { Router } from "express";

const router = Router();

router.patch('/:deskId/:id', async (req, res) => {
  try {
    const { desks } = await req.user.populate('desks');
    const desk = desks.find(desk => desk._id.toString() === req.params.deskId);
    if (!desk) return res.status(404).send('Desk not found');
    if (!desk.settings.editable) return res.status(403).send('Desk is not editable');

    const {order, save} = desk.setDone(req.params.id, req.query.done === 'true');
    await save;
    res.send(String(order));
  } catch (e) {
    console.log(e);
    res.status(500).send('Sorry! Server Error! We will fix it soon');
  }
});

router.patch('/:deskId/:taskId/:subtaskId', async (req, res) => {
  try {
    const { desks } = await req.user.populate('desks');
    const desk = await desks.find(desk => desk._id.toString() === req.params.deskId);
    if (!desk) return res.status(404).send('Desk not found');
    if (!desk.settings.editable) return res.status(403).send('Desk is not editable');

    const {order, save} = desk.setSubDone(req.params.taskId, req.params.subtaskId, req.query.done === 'true');
    await save;
    res.send(String(order));
  } catch (e) {
    console.log(e);
    res.status(500).send('Sorry! Server Error! We will fix it soon');
  }
});

export default router;