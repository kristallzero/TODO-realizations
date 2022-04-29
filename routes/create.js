import { Router } from "express";
import Desk from "../models/desk.js";

const router = Router();

router.post('/', async (req, res) => {
  if (req.query.deskTitle > 20) return res.status(400);
  try {
    const desk = new Desk({
      settings: {
        title: req.query.deskTitle
      }
    });
    await desk.save();
    const user = await req.user;
    const {id, save} = user.addDesk(desk);
    await save; 
    res.json({id: id.toString()});
  } catch (e) {
    console.log(e);
    res.status(500).send('Sorry! Server Error! We will itfix soon');
  }
});

export default router;