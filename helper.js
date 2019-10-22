const path = require('path');
module.exports.storage_path = (s)=> path.join(__dirname,'storage',s);
module.exports.temp_path = (s)=> path.join(__dirname,'storage/temp',s);