const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config/config')
const Premium = require('../models/premiumSubscription');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    index: {unique: true}
  },
  email: {
    type: String,
    required: true,
    index: { unique: true },
    validate: [checkEmail, 'Not a valid {PATH}']
  },
  password: {
    type: String,
    required: true,
    // validate: [checkPassword, '{PATH} does not meet requirements. Must have at least 8 characters 1 Uppercase letter, 1 Lowercase letter, 1 Number and 1 of @,$,!,%,*,?,&,_,-']
  },
  salt: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum : ['user', 'admin', 'superadmin'],
    default: 'user'
  }
},
{ timestamps: true});

UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.password;
    delete ret.salt;
    delete ret._id;
    return ret;
  }
});

UserSchema.pre('save', function(next) {
  this.email = this.email.toLowerCase();
  console.log("Pre method of user");
  if (!this.isModified('password')){
     return next();
  }
  // else if (!checkPassword(this.password)){
  //   return next(Error('Password does not meet requirements. Must have at least 8 characters 1 Uppercase letter, 1 Lowercase letter, 1 Number and 1 of @,$,!,%,*,?,&,_,-'));
  // } 
  else {
    var salt = crypto.randomBytes(16).toString("hex");
    this.salt = salt;
    this.password = crypto.pbkdf2Sync(this.password, salt, 310000, 32, 'sha256').toString('hex');
    return next();
  }
});

UserSchema.methods.passwordCheck = function(){
  return checkPassword(this.password);
}

UserSchema.methods.getSessionData = function(next) {
  checkPremium(this.user_id, function(err, is_prem){
    console.log("inside session data");
    if(err){
      return next(err, {});
    }

    return next(false, {
      user_id: this.user_id,
      role: this.role,
      prem: is_prem
    });
  }.bind(this))

  // return {
  //   user_id: this.user_id,
  //   role: this.role
  // }
};

UserSchema.methods.verifyPassword = function(candidatePassword, next) {
  console.log("In verify password");

    var hashedPassword = crypto.pbkdf2Sync(candidatePassword, this.salt, 310000, 32, 'sha256').toString("hex")
    
    if (this.password == hashedPassword){
        return next(null, true);
    } else {
        return next(null, false);
    }
};

UserSchema.methods.equals = function(user) {
  return this.user_id == user.user_id;
};

UserSchema.methods.getToken = function(){
  return {
    user_id: this.user_id,
    token: crypto.randomBytes(32).toString("hex"),
    expires_at: new Date(new Date().getTime() + 60 * 60000)
  };
}

UserSchema.methods.sendEmail = function(isHTML, subject, body, next){
  const mailer = nodemailer.createTransport(config.email);
  if (isHTML){
    const mail = {
      from: process.env.email_user,
      to: this.email,
      subject: subject,
      html: body
    };
    mailer.sendMail(mail, next);
  } else {
    console.log("sending text email");
    const mail = {
      from: process.env.email_user,
      to: this.email,
      subject: subject,
      text: body
    };
    mailer.sendMail(mail, next);
  }
}

function checkPassword(password){
  if (password === this.email){
    return false;
  } else if (!config.regex.password_pattern.test(password)){
    return false;
  }
  return true;
}

function checkEmail(email){
  if (!config.regex.email.test(email)){
    return false;
  }
  return true;
}

function checkPremium(user_id, next){
  Premium.findOne({user_id: user_id, active: true}).exec(function(err, premium){
    if(err){
      return next(err, false);
    }

    if(!premium){
      return next(false, false);
    }

    premium.updateSubscription(function(err){
      if(err){
        return next(err, false);
      }

      return next(false, premium.active);
    })
  });
}

module.exports = mongoose.model('User', UserSchema);
