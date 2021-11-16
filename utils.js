const fs = require('fs');
const path = require('path');

function loadFile(res, filePath) {
    fs.readFile(path.join(__dirname, filePath), 'utf-8', (err, data) => {
        if (err) throw err;
        filePath = filePath.split('.')[1];
        res.writeHead(200, { 'Content-Type': `text/${filePath === 'js' ? 'javascript' : filePath}; charset=utf-8` });
        res.end(data);
    });
}

module.exports = { loadFile: loadFile };