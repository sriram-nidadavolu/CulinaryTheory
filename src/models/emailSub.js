const mongoose = require('mongoose');
const config = require('../config/config')
const paypal = require("../helpers/paypal-api");

const Schema = mongoose.Schema;
const EmailSubSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    }
    },
    {
        timestamps: true
    });

EmailSubSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model('EmailSub', EmailSubSchema);
