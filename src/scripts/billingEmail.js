require('dotenv').config({path: 'src/.env'})
const express = require('express');
const session = require('express-session');
const db = require('../db');
const User = require('../models/user')
const recipe = require("../models/recipe");
const draft = require("../models/draft");
const bookmarkModel = require('../models/BookmarkSchema')
const likemodel = require('../models/LikeSchema');
const Token = require('../models/token');
const Premium = require('../models/premiumSubscription');
const EmailSub = require('../models/emailSub');
const commentModel = require('../models/commentsSchema');
const reportModel = require('../models/ReportSchema');
const userprofile = require('../models/UserProfileSchema');


const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require("fs");
const cheerio = require('cheerio');
const path = require('path');
const PremiumModel = mongoose.model("Premium");
const UserModel = mongoose.model('User');

async function getUsers(){

    const todays = await new Date();
    const days_after_5 = todays.setDate(todays.getDate() + 5);
    query = {next_billing : {$exists : true}, next_billing : {$lte : days_after_5, $gte : todays}}
    const users = await PremiumModel.find(query,{user_id : 1}).exec();
    return users;

}

async function getUserEmails(usersToFind){

    
    query = {user_id : {$in : usersToFind}};
    const users = await UserModel.find(query, {email : 1}).exec();
    return users;

}
async function sendMailer(subject, body, maillist){
    const mailer = await nodemailer.createTransport(email);
    const mail = {
        from: process.env.email_user,
        to: process.env.email_user,
        bcc: maillist,
        subject: subject,
        html: body
      };
      const res = await mailer.sendMail(mail);
}



async function main(){
    var users = await getUsers();
    var usersTo = [];
    for (const user of users) {
        usersTo.push(user.user_id);
    }
    
    var usersEmails = await getUserEmails(usersTo);
    for (const user of usersEmails) {
        usersTo.push(user.email);
    }
    usersTo = usersTo.join(", ");
    console.log(usersTo);
    email = {
        host: "smtp.gmail.com",
        port: 587,
        tls: {
            rejectUnauthorized: true,
            minVersion: "TLSv1.2"
        },
        auth: {
            user: process.env.email_user,
            pass: process.env.email_pass
        }
    }
    
    const body = "Hello from The Culinary Theory. Your premium subscription is due in 5 days. If we do not receive your payment in due time, your subscription will be cancelled. You'll miss out on some cool features we have planned ahead."
    const sendemail = await sendMailer("Your premium subscription is ending",body,usersTo);
    console.log("Done.");
    return 1;
}

main().then(()=>{});