const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../config/config')

const Schema = mongoose.Schema;
const TokenSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    expires: '60m',
    required: true
  }
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

TokenSchema.methods.getResetEmail = function(){
    return `<html lang="en">
    <p> Please <a href="http://${process.env.host_addr}:9000/auth/reset/${this.token}">click</a> here to reset your password or copy paste the below link in your browser. This link is valid only for one hour.</p><br>
    <p>http://${process.env.host_addr}:9000/auth/reset/${this.token}</p>
  </html>`
}

module.exports = mongoose.model('Token', TokenSchema);
