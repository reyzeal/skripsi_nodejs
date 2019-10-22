const mongoose = require('mongoose');
const DocumentSaver = require('../modules/Proposed/RPBDv2');
const {Decimal128, Mixed, Schema} = mongoose;
const fs = require('fs');
const path = require('path');
const laporanScheme = Schema({
    judul : String,
    hash : String,
    size : Number,
    path : {type: String, required: true},
    rev : {type : Number, default: 0},
    owner : {type: Schema.Types.ObjectId, ref: 'Mahasiswa', required: true},
    plagiarism : Decimal128,
    plagiarism_report : String,
    plagiarism_data : {type: Map, of:String},
    plagiarism_date : {type : Date, default: null },
    uploaded : {type:Date, default: Date.now()},
});

laporanScheme.methods.LaporanUpdate = async function(pathFile){
    let Engine = new DocumentSaver(path.basename(this.path), path.dirname(this.path));
    return await Engine.update(pathFile);
};
laporanScheme.methods.LaporanGet = async function(rev){
    let Engine = new DocumentSaver(path.basename(this.path), path.dirname(this.path));
    return await Engine.get(rev,'',true);
};
laporanScheme.methods.LaporanRevert = async function(step){
    let Engine = new DocumentSaver(path.basename(this.path), path.dirname(this.path));
    return await Engine.revert(step);
};
laporanScheme.methods.LaporanUsage = async function(){
    let Engine = new DocumentSaver(path.basename(this.path), path.dirname(this.path));
    let AllLaporan = await Engine.scan();
    let total = 0;
    let result = [];
    for(let i in AllLaporan){
        total += fs.statSync(AllLaporan[i]).size;
        result.push({
            file : path.basename(AllLaporan[i]),
            size : fs.statSync(AllLaporan[i]).size
        });
    }
    return {
        base : result?result[0]:'-',
        total : total,
        files : result
    }
};

mongoose.model('Laporan', laporanScheme);
module.exports = mongoose.model('Laporan');