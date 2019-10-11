const mongoose = require('mongoose');
const {Decimal128, Mixed, Schema} = mongoose;
const {check_password,save_password} = require('./model_helper');

const mahasiswaScheme = Schema({
    nama : String,
    nim : {type: String, required : true, unique: true},
    ipk : Decimal128,
    sks : Number,
    transkrip : {
        type : Map,
        of: Mixed
    },
    mulai_kuliah : Date,
    foto : String,
    password : {type: String, required: true},
    email : {type: String, required : true, unique:true},
});

mahasiswaScheme.pre('save', (a)=>save_password(a));

mahasiswaScheme.methods.comparePassword = (a,b)=>check_password(a,b);
mahasiswaScheme.methods.getPayload = function () {
 return {type:'Mahasiswa', nama: this.nama, nim: this.nim, email:this.email, _id:this._id};
};

mongoose.model('Mahasiswa', mahasiswaScheme);
module.exports = mongoose.model('Mahasiswa');