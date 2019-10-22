const mongoose = require('mongoose');

const SoalProposalScheme = Schema({
    question : String,
    mode : Number,
    option : {
        type : Map,
        of : String
    }
});

mongoose.model('SoalProposal', SoalProposalScheme);
module.exports = mongoose.model('SoalProposal');