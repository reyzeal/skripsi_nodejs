const fs = require('fs');
const path = require('path');
const {storage_path} = require('../../helper');
const fossilDelta = require('fossil-delta');
const {compress} = require('bz2');
const compressjs = require('compressjs');
const Stream = require('stream');
class RLE{
    static encode(s){
        let encoded = '';
        let count;
        for(let i = 0; i < s.length; i++) {
            count = 1;
            while (s[i] === s[i + 1]) {
                count++;
                i++;
            }
            encoded += `${count}_${s[i]};`;
        }
        return encoded;
    }
}
class JBitEncoding{
    static encode(x){
        let data = fs.readFileSync(x);
        let dataI = [];
        let dataII = [];
        let dataLength = data.length;
        let temp = [];
        for(let i = 0; i < dataLength ; i++){
            let current = data.readUInt8(i);
            if(current !== 0){
                dataI.push(current);
                temp.push(1);
            }else{
                temp.push(0);
            }
            if(temp.length === 8){
                let newData = parseInt(temp.join(''), 2);
                dataII.push(newData.toString());
                temp = [];
            }
        }
        fs.writeFileSync(x+'.metadata', new Buffer(RLE.encode(dataII),'utf8'));
        fs.writeFileSync(x+'.bin', new Buffer(dataI,'utf8'));
        // console.log(.length);
        // console.log(dataII.join('').length);
        //fs.writeFileSync(x+'.j8', Buffer.concat([Buffer.from(dataI), Buffer.from(dataII)]));
    }
}
class DeltaEncoding {
    static encode(x, y){
        let data = fs.readFileSync(x);
        let data2 = fs.readFileSync(y);
        let delta = fossilDelta.create(data, data2);

        fs.writeFileSync(x+'.1', delta);
    }
    static compress(x){
        let data = fs.readFileSync(x);
        let compressed = compressjs.Bzip2.compressFile(data);
        fs.writeFileSync(x+'.bzip2', compressed, 'binary');
        // writeStream1.close();
        // let decompressed = compressjs.Bzip2.decompressFile(fs.readFileSync(x+'.1'));
        // fs.writeFileSync(x+'.2', decompressed, 'binary');
        // writeStream2.write(decompressed);
        // writeStream2.close();
    }
}

module.exports = JBitEncoding;

// DeltaEncoding.encode(storage_path('../test/proposed/proposed/lorem.pdf'),storage_path('../test/proposed/proposed/lorem2.pdf'));
JBitEncoding.encode(storage_path('../test/proposed/proposed/lorem.pdf'));
// DeltaEncoding.compress(storage_path('../test/proposed/proposed/lorem.pdf.j8'));
