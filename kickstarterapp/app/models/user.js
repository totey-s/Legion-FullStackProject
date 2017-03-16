var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [2, 25],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'matches',
    arguments: /^([a-zA-Z]{2,20})+$/,
    message: 'Name must not have special characters or numbers.'
  })
];

var usernameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'isAlphanumeric',
    message: 'Username must contain letters and numbers only.'
  })  
];

var emailValidator = [
  validate({
    validator: 'isEmail',    
    message: 'Not a valid email.'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
];

var passwordValidator = [
  validate({
    validator: 'isLength',
    arguments: [8, 35],
    message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters long.'
  }),
  validate({
    validator: 'matches',
    arguments: /^(?=.{8,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/,
    message: 'Password should have at least one capital letter, one small letter and one number.'
  })
];

var UserSchema = new Schema({
  fname:{type:String, required: true, validate: nameValidator},
  lname:{type:String, required: true, validate: nameValidator},
  username:{type:String, lowercase: true, required: true, unique: true, validate: usernameValidator},
  password:{type:String, required: true, validate: passwordValidator},
  email:{type:String, required: true, lowercase: true, unique: true, validate: emailValidator},
  active:{type: Boolean, required: true, default: true},
  permission:{type: String, required: true, default: 'user'}
});

//admin moderator user

UserSchema.pre('save', function(next) {
  var user = this;
  bcrypt.hash(user.password, null, null, function(err, hash){
    if(err) return next(err);
    user.password = hash;
    next();
  });
});

// Will turn BOB DOYLE to Bob Doyle 
UserSchema.plugin(titlize, {
  paths: [ 'name' ] // Array of paths 
});

UserSchema.methods.comparePassword = function(password){
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);

