var createError = require('http-errors');
var express = require('express');
var fs = require('fs');
var https = require('https');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');

dotenv.config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get("/auth_config.json", function (req, res) {
  res.json({
      "domain": "https://dev-7xjdvaspwt881ruz.eu.auth0.com",
      "clientId": '1fUuY0YgNda7RVEvR3S263osBXWvu2o1',
      "audience": 'https://sahliga.com'
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const externalUrl = "not_used";
const port = 4092;
if (externalUrl) {
  const hostname = "127.0.0.1";
  app.listen(port, hostname, () => {
    console.log(`Server locally running at http://${hostname}:${port} and from outside on ${externalUrl}`);
  });
} else {
  https.createServer({
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.cert')
  }, app)
      .listen(port, function () {
      console.log(`SPA running at https://localhost:${port}/`);
  });
}

module.exports = app;
