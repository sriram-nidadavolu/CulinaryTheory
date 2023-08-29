const mongoose = require('mongoose');
const path = require('path');
const config = require('../config/config');
const response = require('../helpers/response');
const User = mongoose.model('User');
const Token = mongoose.model('Token');

exports.authenticate = function(req, res, next) {
  if (req.session.user){
    return response.sendBadRequest(res, "A user is already logged-in!");
  }
    console.log(`Login request`);
  
  if (!req.body.email || !req.body.password) {

    return response.sendBadRequest(res, "Please check the fields enetered");
    
  } 

  User.findOne({ email: req.body.email.toLowerCase() })
  .exec(function(err, user) {
    if (err) {
        console.log("Some error in user find");
        return next(err);
    }

    if (!user) {
        
      console.log("User not found");
        return response.sendUnauthorized(res, "Incorrect username or password");

    } else  {

      user.verifyPassword(req.body.password, function(err, isMatch) {

        if (err) { 
            console.log("Some error in password compare");
            return next(err);
        }

        if (isMatch) {
            var session = req.session;
            user.getSessionData(function(err, user_data){
              console.log("Inside session data");
              if(err){
                console.log("Error creating session");
                return next(err);
              }
              console.log(user_data);
              session.user = user_data;
              return response.sendSuccess(res, "Logged in successfully!");
            })

        } else {
          console.log("Password did not match");
          return response.sendUnauthorized(res, "Incorrect username or password")
        }
        
      });

    }
  });
}

exports.updatePassword = function(req, res, next) {
  console.log(`Update password request`);
  
  if (!req.body.user_id || !req.body.password || !req.body.new_password || !req.body.verify_password) {

    return response.sendBadRequest(res, "Please check the fields enetered. Mandatory fields missing.");
    
  } 

  User.findOne({ user_id: req.body.user_id })
  .exec(function(err, user) {
    if (err) {
        console.log("Some error in user find");
        return next(err);
    }

    if (!user) {
        
      console.log("User not found");
        return response.sendUnauthorized(res, "Incorrect username or password");

    } 

    user.verifyPassword(req.body.password, function(err, isMatch) {

      if (err) { 
          console.log("Some error in password compare");
          return next(err);
      }

      if (!isMatch) {
        console.log("Password did not match");
        return response.sendUnauthorized(res, "Incorrect password")
      }

      if (req.body.new_password != req.body.verify_password) {
        console.log("Passwords do not match.");
        return response.sendBadRequest(res, "Passwords do not match");
      }
      
      user.password = req.body.new_password;
      if (!user.passwordCheck()){
        return response.sendBadRequest(res, "Password does not meet requirements. Must have at least 8 characters 1 Uppercase letter, 1 Lowercase letter, 1 Number and 1 of @,$,!,%,*,?,&,_,-")
      }
      var err = user.validateSync();
      if (err) {
        console.log("Password does not meet requirements");
        return response.sendBadRequest(res, err.message);
      }

      user.save(function(err, user){
        if (err) {
          console.log("Error updating password");
          return next(err);
        }

        return response.sendSuccess(res, "Password updated successfully.");
      })
      
    });
}); 
}

exports.signOut = function(req, res, next) {
  req.session.destroy(function(err){
    
    if(err){
      return next(err);
    }

    return response.sendSuccess(res, "Logged out.")

  });
}

exports.resetPasswordEmail = function(req, res, next) {
  if (!req.body.email) {
    return response.sendBadRequest(res, "Please enter the email address");
  }

  User.findOne({ email: req.body.email.toLowerCase() })
  .exec(function(err, user) {
    if (err) {
        console.log("Some error in user find");
        return next(err);
    }

    if (!user) {
        
      console.log("User not found");
      return response.sendUnauthorized(res, "No acount with given email");

    } 

    var newToken = new Token(user.getToken());
    var err = newToken.validateSync();
    if (err) {
      return next(err);
    }
    
    newToken.save(function(err, token) {
      if (err){
        return next(err);
      }

      const subject = "Reset Password - The Culinary Theory";
      const body = token.getResetEmail();
      user.sendEmail(true, subject, body, function(err){
        if(err){
          return next(err);
        }
        return response.sendSuccess(res, "Please check your inbox for the link to reset your password.");
      });
    });
    
  });

}

exports.renderResetPage = function(req, res, next) {
  if(!req.body.token){
    return response.sendBadRequest(res, "No token");
  }
  return res.sendFile("set_password.html", {root: path.join(path.dirname(__dirname), "views")});
}

exports.resetPassword = function(req, res, next) {
  if(!req.body.token){
    return response.sendBadRequest(res, "No token");
  }

  User.findOne({ user_id: req.body.token.user_id}).exec(
    function(err, user){
      if (err) {
        console.log("Error finding the user");
        return next(err);
      }

      if(!user) {
        console.log("User not found");
        return response.sendBadRequest(res, "User not found");
      }

      if (req.body.password != req.body.verify_password) {
        return response.sendBadRequest(res, "Passwords do not match. Try again");
      }

      user.password = req.body.password;
      if (!user.passwordCheck()){
        return response.sendBadRequest(res, "Password does not meet requirements. Must have at least 8 characters 1 Uppercase letter, 1 Lowercase letter, 1 Number and 1 of @,$,!,%,*,?,&,_,-")
      }
      var err = user.validateSync();
      if (err) {
        console.log("Password does not meet requirements");
        return response.sendBadRequest(res, err.message);
      }

      user.save(function(err, user){
        if (err) {
          console.log("Error updating password");
          return next(err);
        }

        return next();
      })
    }
  );
}

exports.validateResetToken = function(req, res, next) {
  if (!req.params.token && !req.body.token) {
    console.log(req.body);
    return response.sendBadRequest(res, "No valid token.");
  }

  const token_val = req.params.token || req.body.token;

  Token.findOne({ token: token_val }).exec(
    function(err, token){
      if (err) {
        console.log("Error finding token");
        return next(err);
      }

      if(!token) {
        console.log("Token not present");
        return response.sendUnauthorized(res, "Link not valid/expired");
      }

      if (token.expires_at > new Date()){
        req.body.token = token;
        return next();
      } 
      
      return response.sendBadRequest(res, "Link expired. Please request a new one.")
    });

}

exports.deleteToken = function(req, res, next) {
  req.session.token = null;

  Token.findOneAndDelete(({ token: req.body.token.token }),function(err,doc){  
    if(err){
      return next(err);
    } 
    
    return response.sendSuccess(res, "Password updated.");
});

}

exports.ensureAuthenticated = function(req, res, next) {
  if(req.body.user_id || req.params.user_id){
    return response.sendBadRequest(res, "Unexpected parameter in request: user_id");
  }
    if (req.session.user) {
      req.body.user_id = req.session.user.user_id;
      req.params.user_id = req.session.user.user_id;
      return next();
    }
    return response.sendUnauthorized(res, "Please login and retry");
  };

exports.ensureOwner = function(req, res, next) {
  if (req.body.user_id) {
    if (req.session.user.user_id != req.body.user_id) {
      return response.sendForbidden(res);
    }

  } else if (req.params.user_id) {
    if (req.session.user.user_id != req.params.user_id) {
      return response.sendForbidden(res);
    }

  } else {
    return response.sendBadRequest(res, "user_id missing");
  }
  return next();
}

exports.ensureAdmin = function(req, res, next) {

    if (req.session.user) {
      if (req.session.user.role === "admin") {
        req.body.user_id = req.session.user.user_id;
        req.params.user_id = req.session.user.user_id;
        return next();
      } else {
        return response.sendForbidden(res);
      }
    } else {
      return response.sendUnauthorized(res, "Please login and retry");
    }
};

exports.ensurePremium = function(req, res, next){
  if (req.session.user) {
    if (req.session.user.prem) {
      req.body.user_id = req.session.user.user_id;
      req.params.user_id = req.session.user.user_id;
      return next();
    } else {
      return response.sendForbidden(res, "Please subscribe to premium to access this feature!");
    }
  } else {
    return response.sendUnauthorized(res, "Please login and retry");
  }
}

exports.changeRole = function(req, res, next){
  if (!req.body.target_user) {
    return response.sendBadRequest(res, "No user specified");
  }

  if (!req.body.target_role) {
    return response.sendBadRequest(res, "No target role specified");
  }

  if(!(req.body.target_role == "admin" || req.body.target_role == "user")){
    return response.sendBadRequest(res, "Target role is not valid");
  }

  User.findOne({email: req.body.target_user}, function(err, user){
    if(err) {
      return next(err);
    }

    if(!user) {
      return response.sendBadRequest(res, "User does not exist");
    }

    user.role = req.body.target_role;
    user.save(function(err, user){
      if(err){
        return next(err);
      }

      return response.sendSuccess(res, "User role changed successfully!", user.toJSON());

    });
  });
}

exports.ensureRoot = function(req, res, next){
  if(req.session.user){
    if (req.session.user.role == "superadmin"){
      req.body.user_id = req.session.user.user_id;
      req.params.user_id = req.session.user.user_id;
      return next();
    } else {
      return response.sendForbidden(res);
    }
  } else {
    return response.sendUnauthorized(res, "Please login and retry");
  }
}
