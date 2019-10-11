const express = require('express');
const router = express.Router();
const mahasiswa = require('../models/mahasiswa');
const dosen = require('../models/dosen');
const tatausaha = require('../models/tatausaha');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtStrategy = require('../auth/jwtStrategy');
passport.use(jwtStrategy);
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/create', function (req, res, next) {
  let {type} = req.body;
  let newUser = undefined;
  switch (type) {
    case 'Mahasiswa':
      newUser = new mahasiswa(req.body);
      break;
    case 'Dosen':
      newUser = new dosen(req.body);
      break;
    case 'Tatausaha':
      newUser = new tatausaha(req.body);
      break;
    default:
      res.status(400).json({message:'Malformed request'});
  }
  if(newUser !== undefined)
    newUser.save((err)=>{
      console.log(err);
      if(err) res.send(err);
      else res.json({data:newUser});
    });
});

router.post('/auth', function (req, res, next) {
  let {email, password, type} = req.body;
  let creds = function (err, user) {
    let state = (err, isMatch) => isMatch;
    let pass = password || '';
    user.comparePassword(pass, state);
    console.log(user.getPayload());
    const token = jwt.sign(user.getPayload(), 'secret', {expiresIn : 120});
    return state?res.json(token):res.status(401).json({message:'auth failed'});
  };
  switch (type) {
    case 'Mahasiswa':
      mahasiswa.findOne({email : email}, (err,user) => creds(err, user));
      break;
    case 'Dosen':
      dosen.findOne({email : email}, (err,user) => creds(err, user));
      break;
    case 'Tatausaha':
      tatausaha.findOne({email : email}, (err,user) => creds(err, user));
      break;
    default:
      res.status(400).json({message:'Malformed request'});
  }
});

router.get('/profile', passport.authenticate('jwt',{session:false}), (req, res, next)=>{
  res.json(req.user);
});
module.exports = router;
