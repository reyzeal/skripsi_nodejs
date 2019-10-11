const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

module.exports.save_password = function(next){
    const user = this;
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err,salt){
        if(err) console.log(err);
        bcrypt.hash(user.password, salt, function(err,hash){
            if(err) console.log(err);
            user.password = hash;
            next();
        });
    });
};
module.exports.check_password =function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};