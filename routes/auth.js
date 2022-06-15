import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  req.session.authenticated = true;
  req.session.userId = '62a99ddc92712c9dc8d3c4ed';
  res.send('Successful authenticataion!');
});

export default router;