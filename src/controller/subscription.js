const  mongoose = require("mongoose");
const nanoid = require("nanoid");
const paypal = require("../helpers/paypal-api");
const response = require('../helpers/response');
const config = require("../config/config");

const User = mongoose.model("User");
const Premium = mongoose.model("Premium");
const EmailSub = mongoose.model("EmailSub");

exports.generateSubscription = function(req, res, next){
    if (!req.body.user_id){
        return response.sendBadRequest(res, "No user id");
    }

    User.findOne({user_id: req.body.user_id}).exec(function(err, user){
        if (err){
            console.log("Error searching for the user");
            return next(err);
        }

        if(!user){
            console.log("No user found");
            return response.sendBadRequest(res, "No user found");
        }

        Premium.findOne({user_id: req.body.user_id}).exec(function(err, premium_sub){
            if(err){
                console.log("Error searching premium sub");
                return next(err);
            }
    
            if (premium_sub){
                if (premium_sub.subscribed){
                    return response.sendBadRequest(res, "Active subscription exists");
                }

                if(premium_sub.active){
                    var new_start = new Date(premium_sub.active_till)
                    new_start = new Date(new_start.getTime() + 1440 * 60000);
                    paypal.create_subscription(config.paypal.non_trial_id, user.email, user.email, new_start, function(err, response_json){
                        if (err){
                            console.log("Error creating subscription");
                            return next(err);
                        }

                        return response.sendCreated(res, "Subscription created", response_json);
                    });
                } else {
                    paypal.create_subscription(config.paypal.non_trial_id, user.email, user.email, null, function(err, response_json){
                        if (err){
                            console.log("Error creating subscription");
                            return next(err);
                        }

                        return response.sendCreated(res, "Subscription created", response_json);
                    });
                }
            } else {
                paypal.create_subscription(config.paypal.trial_id, user.email, user.email, null, function(err, response_json){
                    if (err){
                        console.log("Error creating subscription");
                        return next(err);
                    }

                    return response.sendCreated(res, "Subscription created", response_json);
                });
            }
        })
    }); 
}

exports.cancelSubscription = function(req, res, next){
    if (!req.body.user_id) {
        return response.sendBadRequest(res, "No user id");
    }

    User.findOne({user_id: req.body.user_id}).exec(function(err, user){
        if(err){
            console.log("Cancel sub: Error looking for user");
            console.log("Error looking for user");
            return next(err);
        }

        if(!user){
            console.log("Cancel sub: User does not exist");
            return response.sendBadRequest(res, "User does not exist");
        }

        Premium.findOne({user_id: req.body.user_id, subscribed: true}).exec(function(err, premium){
            if(err){
                console.log("Error looking for subscription");
                return next(err);
            }

            if(!premium) {
                console.log("Cancel sub: No active subscription");
                return response.sendBadRequest(res, "No active subscription");
            }

            premium.cancelSub(function(err){
                if (err){
                    console.log("Error cancelling subscription");
                    return next(err);
                }

                premium.subscribed = false;
                premium.next_billing = undefined;

                premium.save(function(err, premium){
                    if (err){
                        console.log("Error saving cancelled subscription");
                        return next(err);
                    } else {

                        req.return_data = premium.toJSON();
                        req.subscribed = false;
                        return next();
                        // return response.sendSuccess(res, "Cancelled successfully", premium.toJSON());
                    }
                });
            });
        });
    });
}


exports.subscribe = function(req, res, next){
    if(!req.body.user_id || !req.body.paypal_id){
        return response.sendBadRequest(res, "No user id/subscription id");
    }

    User.findOne({user_id: req.body.user_id}).exec(function(err, user){
        if(err){
            console.log("Error looking for user");
            return next(err);
        }

        if(!user){
            return response.sendBadRequest(res, "User does not exist");
        }

        req.body.sub_id = nanoid();
        var email_sub = new EmailSub({user_id: user.user_id, email: user.email});
        var premium_sub = new Premium(req.body);
        premium_sub.setBillingDate(function(err){
            if (err) {
                console.log("Error setting the next billing date");
                return response.sendBadRequest(res, "Not a valid paypal subscription");
            }
            console.log(premium_sub);
            premium_sub.save(function(err, premium_sub){
                if(err){
                    console.log("Error saving subscription details");
                    return next(err);
                }
                email_sub.save(function(err, email_sub){
                    req.session.user.prem = true;
                    req.return_data = premium_sub.toJSON();
                    req.subscribed = true;
                    return next();
                    // return response.sendCreated(res, "Subscription successful", premium_sub.toJSON());
                })

                // return response.sendCreated(res, "Subscription successful", premium_sub.toJSON());
            });
        });
    });
}

exports.getSubscription = function(req, res, next){
    if(!req.body.user_id){
        return response.sendBadRequest(res, "No user id");
    }

    Premium.findOne({user_id: req.body.user_id, active: true}).exec(function(err, premium){
        if (err){
            console.log("Error looking for premium sub details");
            return next(err);
        }

        if(!premium){
            var data = {
                active: false,
                subscribed: false,
            }
            return response.sendSuccess(res, "No premium subscription", data);
        }

        if(!premium.active){
            var data = {
                active: false,
                subscribed: false,
            }
            return response.sendSuccess(res, "No active subscription", data);
        }

        return response.sendSuccess(res, "Success", premium.toJSON());
    })
}

exports.isPremiumUser = function(req, res, next){
    if(req.session.user){
        if(req.session.user.prem){
            return response.sendSuccess(res, "Success", {status: true});
        } else {
            return response.sendSuccess(res, "Success", {status: false});
        }
    }
    return response.sendUnauthorized(res, "Please login and retry");
}

exports.isEmailSub = function(req, res, next){
    if (!req.body.user_id){
        return response.sendBadRequest(res, "No user id");
    }

    EmailSub.findOne({user_id: req.body.user_id}).exec(function(err, email_sub){
        if(err){
            console.log("Error finding the email subscription");
            return next(err);
        }

        if(!email_sub){
            return response.sendSuccess(res, "Not subscribed", {subscribed: false});
        }

        return response.sendSuccess(res, "Subscribed to emails", {subscribed: true});
    });
}

exports.subscribeEmail = function(req, res, next){
    if (!req.body.user_id){
        return response.sendBadRequest(res, "No user id");
    }

    User.findOne({user_id: req.body.user_id}).exec(function(err, user){
        if (err) {
            console.log("Error looking for user");
            return next(err);
        }

        if(!user) {
            return response.sendBadRequest(res, "User does not exist");
        }

        EmailSub.findOne({user_id: user.user_id}).exec(function(err, email_sub){
            if(err) {
                console.log("Error finding email subscription");
                return next(err);
            }

            if(email_sub) {
                return response.sendBadRequest(res, "Already subscribed to emails");
            }

            var new_email_sub = new EmailSub({user_id: user.user_id, email: user.email})
            new_email_sub.save(function(err, new_email_sub){
                if(err) {
                    console.log("Error creating email subscription");
                    return next(err);
                }

                return response.sendCreated(res, "Subscibed to emails", new_email_sub.toJSON());
            });
        });
    });
}

exports.unsubEmail = function(req, res, next){
    if (!req.body.user_id) {
        return response.sendBadRequest(res, "No user id");
    }

    EmailSub.findOneAndDelete({user_id: req.body.user_id}).exec(function(err, email_sub){
        if(err) {
            console.log("Error looking for email subscription");
            return next(err);
        }

        if(!email_sub){
            return response.sendNotFound(res, "User not subscribed to emails");
        }

        return response.sendSuccess(res, "Successfully unsubscribed");
    })
}

exports.sendSubEmail = function(req, res, next){
    if (!req.body.user_id || !req.return_data || req.subscribed === undefined){
        return response.sendBadRequest(res, "Required data missing");
    }
    User.findOne({user_id: req.body.user_id}, function(err, user){
        if (user){
            var message_text = ""
            if (req.subscribed) {
                message_text = "Hello,\nYou have successfully subscribed to The Culinary Theory Premium\n\nThe Culinary Theory Team";
            } else {
                message_text = "Hello,\nYou have successfully unsubscribed to The Culinary Theory Premium\n\nThe Culinary Theory Team";
            }
            user.sendEmail(false, "The Culinary Theory Premium", message_text, function(err){
                return response.sendSuccess(res, "Success", req.return_data);
            })
        } else {
            return response.sendSuccess(res, "Success", req.return_data);
        }
    });
}
