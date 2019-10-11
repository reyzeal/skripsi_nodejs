const mongoose = require('mongoose');
const {Decimal128, Mixed, Schema} = mongoose;

const proposalScheme = Schema({
    judul : String,
    hash : String,
    plagiarism : Decimal128,
    plagiarism_report : String,
    plagiarism_data : {type: Map, of:String},
    plagiarism_date : {type : Date, default: null }
});

mongoose.model('Proposal', proposalScheme);
module.exports = mongoose.model('Proposal');