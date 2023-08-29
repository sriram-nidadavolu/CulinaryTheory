require('dotenv').config({path: 'src/.env'})
const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./db');
const User = require('./models/user')
const recipe = require("./models/recipe");
const draft = require("./models/draft");
const bookmarkModel = require('./models/BookmarkSchema')
const likemodel = require('./models/LikeSchema');
const Token = require('./models/token');
const Premium = require('./models/premiumSubscription');
const EmailSub = require('./models/emailSub');
const commentModel = require('./models/commentsSchema');
const reportModel = require('./models/ReportSchema');
const userprofile = require('./models/UserProfileSchema');

const routes = require('./routes');
const config = require("./config/config");

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'static')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3000000 },
  rolling: true
}));

app.get("/", function(req, res){
  res.send("The Culinary Theory");
})
app.use('/', routes);

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.run_env === 'debug' ? err : {};

  // render the error page
  console.log(err)
  res.status(err.status || 500);
  res.sendFile("error.html", {root: path.join(__dirname, "views")})
});

const port = config.server.port;
app.listen(port, debug=true);
console.log('Node + Express REST API skeleton server started on port: ' + port);
console.log(config.database.url);

module.exports = app;