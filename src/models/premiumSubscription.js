const mongoose = require('mongoose');
const config = require('../config/config')
const paypal = require("../helpers/paypal-api");

const Schema = mongoose.Schema;
const PremiumSchema = new Schema({
    sub_id: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    paypal_id: {
        type: String,
        required: true
    },
    next_billing : {
        type: Date,
        default: undefined
    },
    subscribed: {
        type: Boolean,
        default: true
    },
    active_till: {
        type: Date,
        default: undefined
    }
    },
    {
        timestamps: true
    });

PremiumSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret._id;
    delete ret.paypal_id;
    return ret;
  }
});

PremiumSchema.methods.setBillingDate = function(next){
    console.log("Setting next billing date");
    console.log(this);
    paypal.get_subscription(this.paypal_id, function(err, details){
        if (err){
            return next(err);
        }

        if(details.billing_info && details.billing_info.next_billing_time){
            this.next_billing = details.billing_info.next_billing_time;
            this.active_till = details.billing_info.next_billing_time;
            // console.log(this);
            return next(false);
        } else{
            var err = Error("No next billing data");
            return next(err);
        }
    }.bind(this));
}

PremiumSchema.methods.updateSubscription = function(next){
    console.log("inside update sub");
    if(!this.subscribed){
        if(this.active_till < new Date()){
            this.active = false;
            this.active_till = undefined;
            
            this.save(function(err, sub){
                if(err){
                    return next(err);
                }

                return next(false);
            });
        } else {
            return next(false);
        }
    } else{
        paypal.get_subscription(this.paypal_id, function(err, details){
            if(err){
                return next(err);
            }

            if (details.status === "CANCELLED"){
                if (this.active_till > new Date()){
                    this.subscribed = false;
                    this.next_billing = undefined;
                } else {
                    this.active = false;
                    this.subscribed = false;
                    this.active_till = undefined;
                    this.next_billing = undefined;
                }
                this.save(function(err, sub){
                    if(err){
                        return next(err);
                    }
    
                    return next(false);
                });
            } else {
                return next(false);
            }
        }.bind(this))
    }
}

PremiumSchema.methods.cancelSub = function(next){
    paypal.cancel_subscription(this.paypal_id, "User requested", function(err){
        if (err){
            return next(err);
        }
        next(false);
    });
}

module.exports = mongoose.model('Premium', PremiumSchema);
