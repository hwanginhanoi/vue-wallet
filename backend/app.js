let express = require('express');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let categoryRouter = require('./routes/category');
let transactionsRouter = require('./routes/transactions');
let ratingRouter = require('./routes/rating');


let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/index', indexRouter);
app.use('/users', usersRouter);
app.use('/category', categoryRouter);
app.use('/transactions', transactionsRouter);
app.use('/ratings', ratingRouter);

module.exports = app;