const http = require('http');
const utils = require('./utils/utils');

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        console.log(`New request: ${req.url}`);
        if (req.url === '/') utils.loadFile(res, 'index.html');
        else utils.loadFile(res, req.url.slice('7'));
    } else {
        console.log('post');
    }
});

server.listen(3000, () => console.log('Server was started'));