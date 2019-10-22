const mongoose = require('mongoose');
const {storage_path} = require("../helper");
const {Decimal128, Mixed, Schema, ObjectId} = mongoose;
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
    proposals : [{type : ObjectId, ref:'Proposal'}],
    laporans : [{type : ObjectId, ref:'Laporan'}]
});

mahasiswaScheme.pre('save', (a)=>save_password(a));

mahasiswaScheme.methods.comparePassword = (a,b)=>check_password(a,b);
mahasiswaScheme.methods.getPayload = function () {
 return {type:'Mahasiswa', nama: this.nama, nim: this.nim, email:this.email, _id:this._id};
};
mahasiswaScheme.methods.storagePath = () => {storage_path(this.nim)};

mongoose.model('Mahasiswa', mahasiswaScheme);
module.exports = mongoose.model('Mahasiswa');