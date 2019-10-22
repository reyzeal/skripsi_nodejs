const jsdiff = require('diff');
const lzwcompress = require('node-lzw');
const fs = require('fs');

class Dorev {
    static saveComp(a,b,n){
        console.log(a);
        let diff = jsdiff.diffChars(a,b);

        let result = [];
        let index = 0;
        for(let i=0;i<diff.length;i++){

            if('removed' in diff[i] && diff[i].removed){
                result.push({'r': '','index':diff[i].count});
            }
            if('added' in diff[i] && diff[i].added){
                result.push({'a': diff[i].value,'index':diff[i].count});
            }
            if(!('added' in diff[i])) {
                result.push({'s': '','start':index,'end': index+diff[i].count});
                index += diff[i].count;
            }
        }
        fs.writeFileSync(n,JSON.stringify(result));
    }
    static readComp(a,n){
        let data = fs.readFileSync(n);
        let dataComp = JSON.parse(data);
        let index = 0;
        let hasil = '';
        for(let i in dataComp){
            if('a' in dataComp[i]){
                hasil = hasil + dataComp[i].a;
            }
            if('r' in dataComp[i]){
                a = a.substr(0,hasil.length-dataComp[i].index) + a.substr(hasil.length);
            }
            if('s' in dataComp[i]){
                hasil = hasil + a.substr(dataComp[i].start,dataComp[i].end-dataComp[i].start);
            }
        }
        return hasil;
    }
    static saveComp2(a,b,n){
        let diff = jsdiff.diffChars(a,b);
        let result = [];
        let index = 0;
        for(let i in diff){
            if('removed' in diff[i] && diff[i].removed){
                result.push({'r': '','index':diff[i].count});
            }
            if('added' in diff[i] && diff[i].added){
                result.push({'a': diff[i].value,'index':diff[i].count});
            }
            if(!('added' in diff[i])) {
                result.push({'s': '','start':index,'end': index+diff[i].count});
                index += diff[i].count;
            }
        }
        let dataComp = lzwcompress.encode(JSON.stringify(result));
        fs.writeFileSync(n,dataComp);
    }
    static readComp2(a,n){
        let data = fs.readFileSync(n);
        let dataComp = JSON.parse(lzwcompress.decode(data));
        let index = 0;
        let hasil = '';
        for(let i in dataComp){
            if('a' in dataComp[i]){
                hasil = hasil + dataComp[i].a;
            }
            if('r' in dataComp[i]){
                a = a.substr(0,hasil.length-dataComp[i].index) + a.substr(hasil.length);
            }
            if('s' in dataComp[i]){
                hasil = hasil + a.substr(dataComp[i].start,dataComp[i].end-dataComp[i].start);
            }
        }
        return hasil;
    }
    static decompress(base,patch,filename){
        fs.writeFileSync(filename, this.readComp(base,patch));
    }
    static decompress2(base,patch,filename){
        fs.writeFileSync(filename, this.readComp2(base,patch));
    }
    static getSize(name){
        return fs.statSync(name)['size'];
    }
}

module.exports = Dorev;