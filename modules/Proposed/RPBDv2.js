const fs = require('fs');
const path = require('path');
const bsdiff = require('bsdiff-nodejs');
const lzma = require('lzma-native');
const {storage_path} = require('../../helper');
const TESTDIR = path.join(__dirname,'../../test/proposed/proposed');
class RPBD{
    constructor(basename, dirname){
        this.basename = basename;
        this.dirname = dirname;
        this.patches = [];
        this.scan();
        console.log(this.patches);
    }
    getPath(s){
        return path.join(this.dirname, s);
    }
    LZMAcompress(data){
        if(Buffer.isBuffer(data))
            return lzma.compress(data);
        return lzma.compress(fs.readFileSync(data));
    }
    LZMAdecompress(data){
        if(Buffer.isBuffer(data))
            return lzma.decompress(data);
        return lzma.decompress(fs.readFileSync(data));
    }
    async update(data){
        let that = this;
        console.log('update');
        if(this.patches.length){
            console.log('analyze diff');
            let raw = fs.readFileSync(this.patch(-1));
            return this.LZMAdecompress(raw).then(i => {
                fs.writeFileSync(that.patch(-1), i);
                console.log('success decompress base');
                bsdiff.diffSync(data, that.patch(-1), that.getPath(that.basename+`.${that.patches.length}`));
                fs.copyFileSync(data, that.patch(-1));

            }).then(async() =>{
                raw = fs.readFileSync(that.patch(-1));
                await that.LZMAcompress(raw).then(i => {
                    fs.writeFileSync(that.patch(-1), i);
                    console.log('success compress base');
                });
                that.scan();
            });
        }
        else{
            console.log('copying data as base');
            fs.writeFileSync(this.getPath(this.basename), fs.readFileSync(data));
            let raw = fs.readFileSync(this.getPath(this.basename));
            return this.LZMAcompress(raw).then(i => {
                fs.writeFileSync(that.getPath(that.basename), i);
                that.scan();
            });
        }
    }
    patch(rev){
        rev = rev < 0? this.patches.length + rev : rev;
        return this.patches[rev];
    }
    revert(step){
        const OUTPUT_PATH = this.getPath('_'+this.basename);
        if(fs.existsSync(OUTPUT_PATH))
            fs.unlinkSync(OUTPUT_PATH);
        this.scan();
        let that = this;
        if(step < 0 || step > this.patches.length - 1) return Error;
        let i = this.patches.length - 2;
        let output = OUTPUT_PATH;
        let newOutput = '';
        fs.copyFileSync(this.getPath(this.basename), output);
        let raw = fs.readFileSync(output);
        return this.LZMAdecompress(raw).then(async result => {
            fs.writeFileSync(output, result);
            while(step && i >= 0){
                newOutput = this.getPath('_'+path.basename+(this.patch(i)));
                bsdiff.patchSync(output, newOutput, this.patch(i));
                fs.unlinkSync(output);
                fs.unlinkSync(this.patch(i));
                output = newOutput;
                i -- ;
                step --;
            }
            if(newOutput !== ''){
                fs.copyFileSync(newOutput, this.getPath(this.basename));
                await this.LZMAcompress(this.getPath(this.basename)).then((i) => {
                    fs.writeFileSync(that.getPath(that.basename), i);
                    that.scan();
                });
                fs.unlinkSync(newOutput);
            }
        });
    }
    async get(rev, filename = '', buffer = false){
        console.log('get');
        const OUTPUT_PATH = this.getPath('_'+this.basename);
        if(fs.existsSync(OUTPUT_PATH))
            fs.unlinkSync(OUTPUT_PATH);
        this.scan();
        if(rev > this.patches.length - 1) return Error('overflow');
        let i = this.patches.length - 2;
        let output = OUTPUT_PATH;
        let newOutput = '';
        fs.copyFileSync(this.getPath(this.basename), output);
        let raw = fs.readFileSync(this.getPath(this.basename));
        return this.LZMAdecompress(raw).then(result => {
            console.log('decompressed');
            fs.writeFileSync(output, result);
            while(rev && i >= 0){
                console.log(this.patch(i), fs.statSync(output).size);
                newOutput = this.getPath('_'+path.basename(this.patch(i)));
                bsdiff.patchSync(output, newOutput, this.patch(i));
                fs.unlinkSync(output);
                output = newOutput;
                i -- ;
                rev --;
            }
            console.log(newOutput);
            if(newOutput !== ''){
                buffer = buffer?fs.readFileSync(newOutput):null;
                if(filename !== '') {
                    fs.copyFileSync(newOutput, filename);
                }
                else if(!buffer){
                    fs.copyFileSync(newOutput, OUTPUT_PATH);
                }
                fs.unlinkSync(newOutput);
            }else{
                buffer = buffer?fs.readFileSync(output):null;
                if(filename !== '') {
                    fs.copyFileSync(output, filename);
                }
                fs.unlinkSync(output);
            }
            if(buffer) return buffer;
        });
    }
    async scan(){
        let that = this;
        this.patches = fs.readdirSync(this.dirname).filter((i)=>{
            return i.indexOf(that.basename) === 0;
        }).sort();
        for(let i in this.patches){
            this.patches[i] = this.getPath(this.patches[i]);
        }
        return this.patches;
    }
}

module.exports = RPBD;
//
// let data = (new RPBD('x',TESTDIR));
// // // if(!data.patches.length){
// // //
// // // }
// let x = async () => {
// // //     // await data.get(0,path.join(TESTDIR,'Test0.pdf'));
// // //
// // //     // await data.get(0,path.join(TESTDIR,'Test1.pdf'));
// // //     // await data.get(1);
// //     await data.update(path.join(TESTDIR,'lorem.pdf'));
// //     await data.update(path.join(TESTDIR,'lorem2.pdf'));
// // //     // await data.update(path.join(TESTDIR,'What is Lorem Ipsum3.pdf'));
// // //     await data.revert(1);
//     console.log(await data.get(1,'',true));
// };
// x();
// // data.revert(1);

