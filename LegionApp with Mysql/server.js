var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
var path = require('path');

//-------------------------------------MySQL Connection---------------------------------------------
/*
var Sequelize = require('sequelize');
var mysql = require('mysql');

var sequelize = new Sequelize('legion', 'root', 'root', {
  host: "localhost",
  port: 3306
});

sequelize.authenticate().then(function(err){
	if(err){
		console.log('Unable to connect to the database:', err);
	}else{
		console.log('Connection has been established successfully.');
	}
});
*/

//Creating a table called user with columns username and birthday of types String and Date respectively
/*
var User = sequelize.define('user', {
  username: Sequelize.STRING,
  birthday: Sequelize.DATE
});
*/

//Adding record of janedoe to table 'user'.
/*
sequelize.sync().then(function() {
  return User.create({
    username: 'janedoe',
    birthday: new Date(1980, 6, 20)
  });
}).then(function(jane) {
  console.log(jane.get({
    plain: true
  }));
});
*/
//-----------------------------------------------------------------------------------------------

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname+"/public"));
app.use('/api', appRoutes);

//http://localhost:8080/api/users

/*
mongoose.connect('mongodb://localhost:27017/kickstarter');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Successfully Connected to mongodb");
});
*/

app.get('*', function(req,res){
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(port);
console.log("Running the server on port: "+port);