import path from 'path';
import fs from 'fs';

export const get = () => new Promise((res, rej) =>
  fs.readFile(path.resolve('data', 'desk.json'), 'utf-8', (err, data) =>
    err ? rej(err) : res(JSON.parse(data))));

const getByOrder = order => new Promise(async res => {
  const desk = await get();
  res({ desk, task: desk[order] });
});

export const put = task => new Promise(async (res, rej) => {
  const desk = await get();

  let order =
    task.metadata.important
      ? 0
      : desk.findIndex(el => !el.metadata.important);
  desk.splice(order, 0, task);

  fs.writeFile(path.resolve('data', 'desk.json'), JSON.stringify(desk), err => err ? rej(err) : res(String(order)));
});

export const done = (order, isDone) => new Promise(async (res, rej) => {
  const { desk, task } = await getByOrder(order);

  desk.splice(order, 1);

  let newOrder =
    isDone
      ? desk.findIndex(el => el.metadata.done)
      : task.metadata.important
        ? 0
        : desk.findIndex(el => !el.metadata.important || el.metadata.done);

  task.metadata.done = isDone;

  if (newOrder === -1) desk.push(task);
  else desk.splice(newOrder, 0, task);
  fs.writeFile(path.resolve('data', 'desk.json'), JSON.stringify(desk), err => err ? rej(err) : res(String(newOrder)));
});

export const doneSub = (order, subOrder, isDone) => new Promise(async (res, rej) => {
  const { desk, task } = await getByOrder(order);
  const subtasks = task.data.subtasks;
  const subtask = subtasks[subOrder];

  subtasks.splice(subOrder, 1);
  let newOrder =
    isDone
      ? subtasks.findIndex(el => el.done)
      : 0;

  subtask.done = isDone;

  if (newOrder === -1) subtasks.push(subtask);
  else subtasks.splice(newOrder, 0, subtask);
  fs.writeFile(path.resolve('data', 'desk.json'), JSON.stringify(desk), err => err ? rej(err) : res(String(newOrder)));
});

export const deleteTask = order => new Promise(async (res, rej) => {
  const desk = await get();
  desk.splice(order, 1);
  fs.writeFile(path.resolve('data', 'desk.json'), JSON.stringify(desk), err => err ? rej(err) : res());
});