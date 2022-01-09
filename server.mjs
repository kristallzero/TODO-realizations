import http from 'http';
import fs from 'fs';
import path from 'path';
import { jsonHandler } from './handlers.mjs';

export const desks = {};

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    console.log(`New request: ${req.url}`);
    if (path.extname(req.url) === '.json') {
      jsonHandler(req.url.slice(1), 0).then(json => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify(json));
      }).catch(err => {
        res.writeHead(err);
        res.end();
      });
    } else {
      if (req.url === '/') req.url = '/index.html';
      fs.readFile(path.resolve('views', req.url.slice(1)), (err, data) => {
        if (err) { res.writeHead(404); res.end(); }
        else {
          const ext = path.extname(req.url).slice(1);
          switch (ext) {
            case '/': res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
              break;
            case 'js': res.writeHead(200, { 'Content-Type': 'application/javascript; charset=UTF-8' });
              break;
            case 'png': res.writeHead(200, { 'Content-Type': 'image/png' });
              break;
            case 'ico': res.writeHead(200, { 'Content-Type': 'image/ico' });
              break;
            default:
              res.writeHead(200, { 'Content-Type': `text/${ext}; charset=UTF-8` })
          }
          res.end(data);
        }
      });
    }
  } else if (req.method === 'POST') {
    let data = '';
    req.on('data', buffer => data += buffer.toString());
    req.on('end', () => jsonHandler(req.url.slice(1), JSON.parse(data)).then(code => res.writeHead(code)));
    res.end();
  }
});

server.listen(3000, () => console.log('Server was started'));
