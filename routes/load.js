import { Router } from "express";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const user =
      await req.user
        .populate('desks')
        .lean();
    const desk = user.desks[0];
    user.desks.splice(0, 1);
    res.render('desk', { ...user, desk });
  } catch (e) {
    res.status(500).send('Sorry! Server Error! We will fix it soon');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user =
      await req.user
        .populate('desks')
        .lean();
    let deskIndex = user.desks.findIndex(desk => desk._id.toString() === req.params.id);
    if (deskIndex === -1) return res.redirect('/');
    const desk = user.desks[deskIndex];
    user.desks.splice(deskIndex, 1);

    res.render('desk', { ...user, desk });
  } catch (e) {
    console.log(e);
    res.status(500).send('Sorry! Server Error! We will fix it soon');
  }
});

export default router;