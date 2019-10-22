const mongoose = require('mongoose');
const {Decimal128, ObjectId, Schema} = mongoose;

const PenilaianProposalScheme = Schema({
    question : {
        type:ObjectId,
        ref:'SoalProposal'
    },
    answer_by : {
        type:ObjectId,
        ref:'Mahasiswa'
    },
    answer_txt : Text,
    answer_number : Decimal128,
    proposal : {
        type:ObjectId,
        ref:'Proposal'
    },
});

mongoose.model('PenilaianProposal', PenilaianProposalScheme);
module.exports = mongoose.model('PenilaianProposal');