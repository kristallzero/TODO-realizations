import { Router } from 'express';
import bscrypt from 'bcryptjs';

import User from '../models/user.js';

const router = Router();

router.get('/', (req, res) => {
  res.render('reg', { layout: 'simple-main', registerError: req.flash('registerError'), loginError: req.flash('loginError') });
});


router.post('/register', async (req, res) => {
  try {
    const { username, email, password, check } = req.body;
    if (password !== check) {
      req.flash('registerError', 'Different passwords');
      return res.redirect('/auth');
    }
    if (await User.findOne({ email })) {
      req.flash('registerError', 'This email is already in use');
      return res.redirect('/auth');
    }
    const user = new User({
      username,
      email,
      password: await bscrypt.hash(password, 12)
    });
    await user.save();

    req.session.userID = user._id;
    req.session.authenticated = true;
    req.session.save(err => {
      if (err) throw new err;
      res.redirect('/');
    });
  } catch (e) {
    console.log(e);
    res.redirect('/auth#login');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('loginError', 'Wrong email or password');
      return res.status(400).redirect('/auth');
    }
    if (!await bscrypt.compare(password, user.password)) {
      req.flash('loginError', 'Wrong email or password');
      return res.status(400).redirect('/auth');
    }
    req.session.userID = user._id;
    req.session.authenticated = true;
    req.session.save(err => {
      if (err) throw err;
      res.redirect('/');
    });
  } catch (e) {
    console.log(e);
    res.redirect('/auth');
  }
});

router.get('/logout', async (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) throw err;
      res.redirect('/');
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Server Error' });
  }
});

export default router;