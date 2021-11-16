const http = require('http');
const utils = require('./utils');

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url !== '/favicon.ico') {
        console.log(`New request: ${req.url}`);
        if (req.url === '/') utils.loadFile(res, '/pages/index.html');
        else utils.loadFile(res, req.url);

    } else if (req.method === 'POST') {
        console.log('post');
    }
});

server.listen(3000, () => console.log('Server was started'));