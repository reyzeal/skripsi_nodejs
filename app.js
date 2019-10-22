const createError = require('http-errors');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const fileupload = require('express-fileupload');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const proposalRouter = require('./routes/proposal');
const cron = require('node-cron');
const fs = require('fs');
cron.schedule('*/2 * * * *', async () =>{
  let temp = fs.readdirSync(path.join(__dirname,'storage/temp'));
  for(let i in temp){
    fs.unlink(path.join(__dirname,'storage/temp',temp[i]), () => console.log(`Deleted ${temp[i]}`));
  }
});
require('dotenv').config();

const app = express();

mongoose.connect(process.env.db_url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

// app.use(cors);
// app.use(passport.initialize);
// app.use(passport.session);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload({
  useTempFiles : true,
  tempFileDir : path.join(__dirname, 'storage', 'temp'),
  // safeFileNames: true,
  createParentPath: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/proposal', proposalRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.render('error', {
    message : err.message,
    status : err.status,
    stack : err.stack
  });
});
module.exports = app;
exports.APP_PATH = __dirname;
