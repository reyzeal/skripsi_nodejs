const mongoose = require('mongoose');
const {Decimal128, Mixed, Schema} = mongoose;
const {check_password,save_password} = require('./model_helper');

const tatausahaScheme = new Schema({
    nama : String,
    noinduk : {type: String, required : true},
    foto : String,
    password : {type: String, required : true},
    email : {type: String, required : true},
});

tatausahaScheme.pre('save', (a)=>save_password(a));
tatausahaScheme.methods.comparePassword = (a,b) => check_password(a,b);
tatausahaScheme.methods.getPayload = function () {
    return {type:'Tatausaha', nama: this.nama, noinduk: this.noinduk, email:this.email, _id:this._id};
};
mongoose.model('Tatausaha', tatausahaScheme);
module.exports = mongoose.model('Tatausaha');