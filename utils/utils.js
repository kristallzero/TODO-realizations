const fs = require('fs');
const path = require('path');

function loadFile(res, loadingFile) {
    fs.readFile(path.join(__dirname, '..', 'pages', loadingFile), 'utf-8', (err, data) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': `text/${loadingFile.split('.')[1]}; charset=uft-8` });
        res.end(data);
    });
}

module.exports = { loadFile: loadFile };