import { Router } from "express";

const router = Router();

router.get('/', async (req, res) => {
  try {
    res.render('desk', await req.user.populate('desk').select('user desk').lean());
  } catch (e) {
    res.status(500).send(e);
  }
});

export default router;