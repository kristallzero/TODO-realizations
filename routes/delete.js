import { Router } from "express";

const router = Router();

router.delete('/:deskId/:id', async (req, res) => {
  try {
    const { desks } = await req.user.populate('desks');
    const desk = desks.find(desk => desk._id.toString() === req.params.deskId);
    if (!desk) return res.status(404).send('Desk not found');
    if (!desk.settings.editable) return res.status(403).send('Desk is not editable');

    const taskIndex = desk.tasks.findIndex(task => task._id.toString() === req.params.id);
    if (taskIndex === -1) return res.status(404).send('Task not found');

    desk.tasks.splice(taskIndex, 1);
    await desk.save();
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).send('Sorry! Server Error! We will fix it soon');
  }
});

export default router;