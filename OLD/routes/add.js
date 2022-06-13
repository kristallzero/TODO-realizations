import { Router } from "express";

const router = Router();

router.post('/:id', async(req, res) => {
  try {
    const user = await req.user.populate('desks');
    const desk = user.desks.find(desk => desk._id == req.params.id);
    if (!desk) return res.status(404).end('Desk not found');
    const {id, order, save} = desk.createTask(req.body);
    await save;
    res.json({id: id.toString(), order});
  } catch (e) {
    res.status(500).end('Sorry! Server Error! We will fix it soon');
  }
});

export default router;