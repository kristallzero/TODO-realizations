import express from 'express';
import mongoose from 'mongoose';

import exphbs from 'express-handlebars';

import session from 'express-session';
import mongoStore from 'connect-mongodb-session';
const MongoStore = mongoStore(session);

import variables from './middleware/variables.js';

import deskRoutes from './routes/desk.js';

import MONGODB from './keys/index.js';

import User from './models/user.js';
import Desk from './models/desk.js';


const app = express();

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs'
});

const store = new MongoStore({
  collection: 'sessions',
  uri: MONGODB
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(session({
  secret: 'todo',
  resave: false,
  saveUninitialized: false,
  store
}));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(variables);

app.use('/', deskRoutes);

app.get('/', async (req, res) => {
  if (!req.session.authenticated) return res.redirect('/auth');
  const user = await req.user.populate('desks').select('username desks');
  const { username, desks } = user;
  
  const desk = await Desk.findById(desks.splice(0, 1)).populate('tasks').lean();
  await user.populate({ path: 'desks', select: 'settings users', options: { lean: true } });
  
  res.render('desk', { username, desk, desks });
});

const PORT = process.argv.PORT || 3000;

async function main() {
  await mongoose.connect(MONGODB);
  if (!await User.findOne()) {
    const desk = new Desk();
    const user = new User({
      username: 'test',
      email: 'test@s',
      password: '123',
      desks: [desk]
    });
    await user.save();
    desk.users.admins.push(user._id);
    await desk.save();
  }

  app.listen(PORT, () => console.log(`Server has started on localhost:${PORT}`));
}

main();