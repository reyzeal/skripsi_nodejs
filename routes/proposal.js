const express = require('express');
const passport = require('passport');
const Proposal = require('../models/proposal');
const ProposalCtrl = require('../controller/proposal');
const router = express.Router();
const jwtStrategy = require('../auth/jwtStrategy');
passport.use(jwtStrategy);
router.post('/upload',
    passport.authenticate('jwt',{session:false}),
    ProposalCtrl.validate('upload'), ProposalCtrl.upload);
router.get('/get/:id', ProposalCtrl.get);
router.get('/usage',
    passport.authenticate('jwt',{session:false}),
    ProposalCtrl.usage);
module.exports = router;

