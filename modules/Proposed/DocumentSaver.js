const fs = require('fs');
const path = require('path');
let pyshell = require('python-shell').PythonShell;

class DocumentSaver {
    constructor(filesource, saveAt, rename = ''){
        this.state = 0;
        this.filesource = filesource;
        this.filebase = path.join(saveAt,path.basename(filesource));
        this.dirname = saveAt;
        this.patches = [];
        this.command = new pyshell(path.join(__dirname,'main.py'),{pythonPath:'python3'});
        this.command.send(this.filesource);
        this.command.send(this.dirname);
        this.command.send('4');
        this.command.send(rename);
        let that = this;
        this.command.on('message', function (message) {
            if(message === '--start--') that.state = 1;
            else if(message === '--done--') that.state = 2;
            else this.state = 0;
            console.log(message);
        });
        this.command.on('error', function (err) {
            console.log(err);
        });
    }
    scan(){
        this.patches = fs.readdirSync(this.dirname).filter(value => {
            return value.indexOf(path.basename(this.filebase)+'.') === 0;
        });
        return this.patches;
    }
    path(x){
        return path.join(this.dirname, path.basename(x));
    }
    async update(data){
        this.command.send('1');
        this.command.send(data);
        let reader = async () => {
            if(that.state !== 2){
                console.log('not yet', that.state);
                return;
            }
            console.log('ok done');
            console.log('end decompress');
        };
        return await reader();
    }
    async decompress(rev,filename){
        let that = this;
        this.command.send('2');
        this.command.send(rev);
        this.command.send(filename);
        let reader = async () => {
            if(that.state !== 2){
                console.log('not yet', that.state);
                return;
            }
            console.log('ok done');
            console.log('end decompress');
        };
        return await reader();
    }
    close(){
        this.command.end(()=>{
            console.log('dismiss');
        });
    }
}

module.exports = DocumentSaver;

// let a = new DocumentSaver("F:\\proposed\\first\\lorem.pdf","F:\\proposed\\NODE");
// async function f(){
//     // await a.update("F:\\proposed\\first\\lorem2.pdf");
//     // await a.update("F:\\proposed\\first\\What is Lorem Ipsum3.pdf");
//     await a.decompress('0',"F:\\proposed\\NODE\\ori.pdf");
//     await a.decompress('1',"F:\\proposed\\NODE\\1.pdf");
//     await a.decompress('2',"F:\\proposed\\NODE\\2.pdf");
//     a.close();
// };
// f();

// bsdiff.diffSync("F:\\proposed\\NODE\\lorem.pdf","F:\\proposed\\NODE\\lorem2.pdf","F:\\proposed\\NODE\\patch.diff");
// lzma.compress(fs.readFileSync("F:\\proposed\\NODE\\patch.diff")).then(r => {
//     lzma.decompress(r).then(r => {
//         fs.writeFileSync("F:\\proposed\\NODE\\patch.diff",r);
//         bsdiff.patch("F:\\proposed\\NODE\\lorem.pdf","F:\\proposed\\NODE\\hasil.pdf","F:\\proposed\\NODE\\patch.diff");
//     });
// });

