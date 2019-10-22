const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {};
const mahasiswa = require('../models/mahasiswa');
const dosen = require('../models/dosen');
const tatausaha = require('../models/tatausaha');

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('bearer');
opts.secretOrKey = 'secret'; //normally store this in process.env.secret

module.exports = new JwtStrategy(opts, (jwt_payload, done) => {
    let {type} = jwt_payload;
    let callback = function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    };
    switch (type) {
        case 'Mahasiswa':
            mahasiswa.findOne({email:jwt_payload.email}, (err, user) => callback(err, user));
            break;
        case 'Dosen':
            dosen.findOne({email:jwt_payload.email}, (err, user) => callback(err, user));
            break;
        case 'Tatausaha':
            tatausaha.findOne({email:jwt_payload.email}, (err, user) => callback(err, user));
            break;
    }
});