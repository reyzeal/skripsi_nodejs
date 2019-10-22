const express = require('express');
const router = express.Router();
const mahasiswa = require('../models/mahasiswa');
const dosen = require('../models/dosen');
const tatausaha = require('../models/tatausaha');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtStrategy = require('../auth/jwtStrategy');
const CBIS = require('../modules/CBIS/CBIS');
const path = require('path');
const moment = require('moment');
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
    const token = jwt.sign(user.getPayload(), 'secret');
    return state?res.json({token:token}):res.status(401).json({message:'auth failed'});
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
      res.status(400).json({message:'Malformed request',req:req.body});
  }
});

router.get('/profile', passport.authenticate('jwt',{session:false}), (req, res, next)=>{
  mahasiswa.find
  res.json(req.user);
});

router.get('/register/:user', (req, res, next)=>{
  res.render('register');
});

router.post('/register/:user', async (req,res) => {
  let users = undefined;
  let dataUser = req.body;
  switch (req.params.user) {
    case 'mahasiswa':
      await mahasiswa.findOne({nim:dataUser.nim}, function (err,mhs) {
          if(err) return console.log('y',err);
      });

      try{
        let CB = async function(nim,pin) {
          let cb = new CBIS(nim,pin,path.join(__dirname,'../storage/CBIS'));
          return {
            'biodata': await cb.biodata(),
            'transkrip': await cb.transkrip(),
            'krp': await cb.KRP()
          };
        };
        let dataMHS = await CB(req.body.nim,req.body.pin);
        let sks = parseFloat(dataMHS.transkrip.sks);
        let ipk = parseFloat(dataMHS.transkrip.ipk);
        let ambil_TA = false;
        for(let i in dataMHS.krp.data){
          if(dataMHS.krp.data[i].nama_mk.indexOf('Seminar Tugas Akhir') === 0) ambil_TA = true;
          if(dataMHS.krp.data[i].nama_mk.indexOf('Tugas Akhir') === 0) ambil_TA = true;
        }
        if(sks < 130 && ipk < 2 && !ambil_TA){
          return res.json({message:'Belum memenuhi kriteria Tugas Akhir'});
        }else{
          dataUser['ipk'] =ipk;
          dataUser['sks'] =sks;
          let dateschool = dataMHS.biodata['Tanggal masuk/diterima'].match(/(\d+) - (\d+) - (\d+)/);
          dateschool = moment(`${dateschool[1]}-${dateschool[2]}-${dateschool[3]}`,'DD-MM-YYYY').format('YYYY-MM-DD');
          dataUser['mulai_kuliah'] = dateschool;
          console.log(dataUser['mulai_kuliah']);
          mahasiswa.create(dataUser, function(err, mhs) {
            if(err) res.json({message:'sudah terdaftar', error:err});
            else{
              res.json({message:'berhasil'});
            }
          });
        }
      }catch (e) {
        res.json({message:'PIN bermasalah',stack:e});
      }
      break;
    case 'dosen':
      users = new dosen({

      });
      break;
    case 'tatausaha':
      users = new tatausaha({

      });
      break;
  }
});
module.exports = router;
