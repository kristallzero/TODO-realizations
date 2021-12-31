import * as fs from 'fs';
import * as path from 'path';
import { desks } from './server.mjs';

var freeIds = {};

export const jsonHandler = (desk, data) => new Promise(resolve => {
  if (desks[desk]) {
    if (typeof data === 'number') resolve(desks[desk]);
    else resolve(postHandler(data));
  } else {
    fs.readFile(path.resolve('files', 'json', desk), 'utf-8', (err, tasks) => {
      if (err) resolve(401);
      else {
        tasks = JSON.parse(tasks);
        if (!freeIds[desk]) {
          freeIds[desk] = [];
          const ids = [];
          for (const i of tasks) ids.push(i.metadata.id);
          ids.sort((a, b) => a - b);
          for (let i = 0; i < ids.length; i++) if (i !== ids[i]) freeIds[desk].push(i);
          freeIds[desk].push(ids[ids.length - 1] + 1);
        }
        desks[desk] = tasks.slice(0);
        if (typeof data === 'number') resolve(tasks);
        else resolve(postHandler(data));
      };
    });
    setTimeout(() => {
      fs.writeFile(path.resolve('files', 'json', desk), JSON.stringify(desks[desk]), (err) => { if (err) console.log(err) });
      delete desks[desk];
    }, 1000 * 60 * 5);
  }
});

function postHandler(data) {
  switch (data.type) {
    case 'add':
      data.task.metadata.id = freeIds[data.desk].length === 1 ? freeIds[data.desk][0]++ : freeIds[data.desk].shift();
      desks[data.desk].push(data.task);
    case 'delete':
      for (let i = 0; i < desks[data.desk].length; i++)
        if (desks[data.desk][i].metadata.id === data.id) {
          desks[data.desk].splice(i, 1);
          for (let j = 0; j < freeIds[data.desk].length; j++) {
            if (freeIds[data.desk][j] > data.id) freeIds[data.desk].splice(j, 0, data.id);
            break;
          }
        }
      break;
    case 'done':
      for (const i of desks[data.desk])
        if (i.metadata.id === data.id) {
          if (data.subtaskId === undefined) i.metadata.done = data.done;
          else for (let j = 0; j < i.data.subtasks.length; i++) if (j === data.subtaskId) {
            i.data.subtasks[j].done = data.done;
            break;
          }
          break;
        }
    default: return 400;
  }
  return 200;
}