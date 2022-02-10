import express from "express";
import exphbs from "express-handlebars";
import mongoose from 'mongoose';

import loadRoute from './routes/load.js';
import addRoute from './routes/add.js';
import doneRoutes from './routes/done.js';
import deleteRoute from './routes/delete.js';

import keys from './keys/index.js';
import User from './models/user.js';

const PORT = process.env.PORT || 3000;

const app = express();
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (req, res, next) => {
  req.user = User.findById(keys.defaultUserID);
  next();
});

app.use(express.static(resolve('public')));
app.use(express.json());

app.use('/', loadRoute);
app.use('/add', addRoute);
app.use('/done', doneRoutes);
app.use('/delete', deleteRoute);

async function start() {
  await mongoose.connect(keys.MONGODB);
  if (!await User.findOne())
    await new User({
      email: 'testkristi@gmail.com',
      user: {
        name: 'kristi',
        id: 'kristi#0000'
      },
      desk: []
    }).save();
  app.listen(PORT, () => console.log(`Server is running on localhost:${PORT}`));
}

start();