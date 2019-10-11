const mongoose = require('mongoose');
const {Decimal128, Mixed, Schema} = mongoose;
const {save_password, check_password} = require('./model_helper');
const dosenScheme = new Schema({
    nama : String,
    noinduk : {type: String, required : true},
    konsentrasi : {type: Map, of: String},
    foto : String,
    password : {type: String, required : true},
    email : {type: String, required : true},
    privilege : {
        type : Number,
        getters : n => {
            switch (n) {
                case 0:
                    return 'dosen';
                case 1:
                    return 'koordinator';
                case 2:
                    return 'jurusan';
            }
        },
        default : 0,
    }
});

dosenScheme.pre('save',(a)=>save_password(a));

dosenScheme.methods.comparePassword = (a,b) => check_password(a,b);
dosenScheme.methods.getPayload = function () {
    return {type:'Dosen', nama: this.nama, noinduk: this.noinduk, email:this.email, _id:this._id};
};
mongoose.model('Dosen', dosenScheme);
module.exports = mongoose.model('Dosen');