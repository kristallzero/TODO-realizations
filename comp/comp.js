const fs = require('fs');
const path = require('path');

__dirname = path.join(__dirname, '..');

class HTMLPacker {
    htmlFiles = [];
    cssFiles = [];
    jsFiles = [];

    constructor(pagesDir, packedDir) {
        this.pagesDir = pagesDir;
        this.packedDir = packedDir;
    }

    loadFiles(...filesName) {
        for (let i of filesName) {
            let fileContent = {
                fileName: i,
                content: fs.readFileSync(path.join(__dirname, this.pagesDir, i)).toString().replaceAll('\r\n', '').replaceAll('    ', '')
            };
            switch (i.split('.')[1]) {
                case 'html': this.htmlFiles.push(fileContent);
                    break;
                case 'css': this.cssFiles.push(fileContent);
                    break;
                case 'js': this.jsFiles.push(fileContent);
                    break;
                default: throw new Error('Wrong file type');
            }
        }
    }

    notCompiled(htmlFile) {
        for (let str of htmlFile)
            if (str.includes(`<link rel="stylesheet" href="/${this.pagesDir}/`) || str.includes(`<script src="/${this.pagesDir}/`))
                return true;
        return false;
    }

    pack(htmlFileName) {
        if (this.notCompiled()) {
            console.log('test');
            for (let html of this.htmlFiles) {
                let test = [123312, `<link rel="stylesheet" href="test.css"`, 32133];
                for (let css of this.cssFiles) {
                    if (test.includes(`<link rel="stylesheet" href=${css[0]}`))
                        console.log(test[test.indexOf(`<link rel="stylesheet" href=${css[0]}`)].replace(`<style>${css.slice('1')}</style`));
                }
            }
        }
    }
    
    packAll() {

    }
}

const test = new HTMLPacker('pages', 'bin');
test.loadFiles('index.html', 'style.css', 'index.js');
console.log(test.htmlFiles);
console.log(test.cssFiles);
console.log(test.jsFiles);