const {body, validationResult} = require('express-validator/check');
const fs = require('fs');
const {storage_path, temp_path} = require('../helper');
const Proposal = require('../models/proposal');
const md5 = require('md5');
const Stream = require('stream');

exports.upload = async (req, res, next) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return false;
    }
    if(!fs.existsSync(storage_path(req.user.nim))){
        fs.mkdir(storage_path(req.user.nim),() => {
            fs.mkdir(storage_path(`${req.user.nim}/proposal`),()=>{});
            fs.mkdir(storage_path(`${req.user.nim}/laporan`),()=>{});
        });
    }
    let namaFile = storage_path(`${req.user.nim}/proposal/${md5((new Date()).toDateString())}.pdf`);
    let UpdateMode = false;
    let CurrentProposal = await Proposal.findOne({owner: req.user._id}, function (err, P) {
        if(!err) P.ProposalUpdate(req.files.proposal.tempFilePath).then(()=>{
            fs.unlinkSync(req.files.proposal.tempFilePath);
        });
        UpdateMode = true;
        res.send('Updated '+P._id);
    });
    if(!UpdateMode)
        await Proposal.create({
            judul : req.body.judul,
            hash : req.files.proposal.md5,
            size : req.files.proposal.size,
            path : namaFile,
            owner: req.user._id,
        }, async (err, p)=>{
            p.ProposalUpdate(req.files.proposal.tempFilePath).then(()=>{
                fs.unlinkSync(req.files.proposal.tempFilePath);
            });
            res.send(p._id);
        });
};

exports.get = async (req, res, next) => {
    Proposal.findById(req.params.id, async function (err, p) {
        p.ProposalGet(0).then(buffer => {
            res.setHeader('Content-Type','application/pdf');
            let PDF_stream = new Stream.PassThrough();
            PDF_stream.end(buffer);
            PDF_stream.pipe(res);
        });
    });
};

exports.usage = async (req,res,next) =>{
    Proposal.findOne({owner: req.user._id}, async function (err, P) {
        let data = await P.ProposalUsage();
        res.json(data);
    });
};

exports.validate = (method) => {
    switch (method) {
        case 'upload':{
            return [
                body('proposal', 'file tidak ada').exists(),
                body('judul', 'tidak menyertakan judul').exists(),
                body('field', 'topik tidak tercantum').exists()
            ];
        }
    }
};