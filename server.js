import { resolve } from 'path';
import express from "express";
import exphbs from "express-handlebars";

import loadRoute from './routes/load.js';
import addRoute from './routes/add.js';
import doneRoutes from './routes/done.js';
import deleteRoute from './routes/delete.js';

const app = express();
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(resolve('public')));
app.use(express.json());

app.use('/', loadRoute);
app.use('/add', addRoute);
app.use('/done', doneRoutes);
app.use('/delete', deleteRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is starting on localhost:${port}`));