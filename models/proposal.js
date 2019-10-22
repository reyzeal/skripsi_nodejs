const mongoose = require('mongoose');
const DocumentSaver = require('../modules/Proposed/RPBDv2');
const {Decimal128, ObjectId, Schema} = mongoose;
const fs = require('fs');
const path = require('path');
const proposalScheme = Schema({
    judul : String,
    hash : String,
    size : Number,
    path : {type: String, required: true},
    rev : {type : Number, default: 0},
    owner : {type: ObjectId, ref: 'Mahasiswa', required: true},
    plagiarism : Decimal128,
    plagiarism_report : String,
    plagiarism_data : {type: Map, of:String},
    plagiarism_date : {type : Date, default: null },
    uploaded : {type:Date, default: Date.now()},
    accepted : Date,
});

proposalScheme.methods.ProposalUpdate = async function(pathFile){
    let Engine = new DocumentSaver(path.basename(this.path), path.dirname(this.path));
    return await Engine.update(pathFile);
};
proposalScheme.methods.ProposalGet = async function(rev){
    let Engine = new DocumentSaver(path.basename(this.path), path.dirname(this.path));
    return await Engine.get(rev,'',true);
};
proposalScheme.methods.ProposalRevert = async function(step){
    let Engine = new DocumentSaver(path.basename(this.path), path.dirname(this.path));
    return await Engine.revert(step);
};
proposalScheme.methods.ProposalUsage = async function(){
    let Engine = new DocumentSaver(path.basename(this.path), path.dirname(this.path));
    let AllProposal = await Engine.scan();
    let total = 0;
    let result = [];
    for(let i in AllProposal){
        total += fs.statSync(AllProposal[i]).size;
        result.push({
            file : path.basename(AllProposal[i]),
            size : fs.statSync(AllProposal[i]).size
        });
    }
    return {
        base : result?result[0]:'-',
        total : total,
        files : result
    }
};

mongoose.model('Proposal', proposalScheme);
module.exports = mongoose.model('Proposal');