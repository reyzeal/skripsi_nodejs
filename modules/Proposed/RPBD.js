const fs = require('fs');
const path = require('path');
const bsdiff = require('bsdiff-nodejs');

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
    update(data){
        console.log('update');
        if(this.patches.length){
            console.log('analyze diff');
            bsdiff.diffSync(data, this.patch(-1), this.getPath(this.basename+`.${this.patches.length}`));
            fs.copyFileSync(data, this.patch(-1));
        }
        else{
            console.log('copying data as base');
            fs.writeFileSync(this.getPath(this.basename+'.pdf'), fs.readFileSync(data));
        }
        console.log('done');
        this.scan();
    }
    patch(rev){
        rev = rev < 0? this.patches.length + rev : rev;
        return this.patches[rev];
    }
    revert(step){
        const OUTPUT_PATH = this.getPath('_'+this.basename+'.pdf');
        if(fs.existsSync(OUTPUT_PATH))
            fs.unlinkSync(OUTPUT_PATH);
        this.scan();
        if(step < 0 || step > this.patches.length - 1) return Error;
        let i = this.patches.length - 2;
        let output = OUTPUT_PATH;
        let newOutput = '';
        fs.copyFileSync(this.getPath(`${this.basename}.pdf`), output);
        while(step && i >= 0){
            newOutput = this.getPath('_'+path.basename(this.patch(i))+'.pdf');
            bsdiff.patchSync(output, newOutput, this.patch(i));
            fs.unlinkSync(output);
            fs.unlinkSync(this.patch(i));
            output = newOutput;
            i -- ;
            step --;
        }
        if(newOutput !== ''){
            fs.copyFileSync(newOutput, this.getPath(`${this.basename}.pdf`));
            fs.unlinkSync(newOutput);
        }
    }
    get(rev){
        const OUTPUT_PATH = this.getPath('_'+this.basename+'.pdf');
        if(fs.existsSync(OUTPUT_PATH))
            fs.unlinkSync(OUTPUT_PATH);
        this.scan();
        if(rev > this.patches.length - 1) return Error('overflow');
        let i = this.patches.length - 2;
        let output = OUTPUT_PATH;
        let newOutput = '';
        fs.copyFileSync(this.getPath(`${this.basename}.pdf`), output);
        while(rev && i >= 0){
            console.log(this.patch(i), fs.statSync(output).size);
            newOutput = this.getPath('_'+path.basename(this.patch(i))+'.pdf');
            bsdiff.patchSync(output, newOutput, this.patch(i));
            fs.unlinkSync(output);
            output = newOutput;
            i -- ;
            rev --;
        }
        console.log(newOutput);
        if(newOutput !== ''){
            fs.copyFileSync(newOutput, OUTPUT_PATH);
            fs.unlinkSync(newOutput);
        }
    }
    scan(){
        let that = this;
        this.patches = fs.readdirSync(this.dirname).filter((i)=>{
            return i.indexOf(that.basename) === 0;
        }).sort();
        for(let i in this.patches){
            this.patches[i] = this.getPath(this.patches[i]);
        }
    }
}

module.exports = RPBD;

// let data = (new RPBD('6e7a08aba5e8a5f05f96f96ffb799522',TESTDIR));
// if(!data.patches.length){
//     data.update(path.join(TESTDIR,'lorem.pdf'));
//     data.update(path.join(TESTDIR,'lorem2.pdf'));
//     data.update(path.join(TESTDIR,'What is Lorem Ipsum3.pdf'));
// }
// // data.revert(1);
// data.get(1);
