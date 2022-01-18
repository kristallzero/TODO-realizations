import { resolve } from 'path';
import express from "express";
import exphbs from "express-handlebars";

import { router as loadRoute } from './routes/load.mjs';
import { router as addRoute } from './routes/add.mjs';
import { router as doneRoutes } from './routes/done.mjs';
import { router as deleteRoute } from './routes/delete.mjs';

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