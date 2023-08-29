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
const RecipeModel = mongoose.model('Recipes');

async function getUsers(){
    const users = await EmailSub.find({},{email:1}).exec();
    return users;

}
async function getTop5(){
    try {
        console.log("here.")
        const res = await RecipeModel.find({},{title:1, recipe_id:1, description:1,image_url:1},{$sort : {createdAt : -1, _id : 1}}).limit(5).exec();
        return res;
    } catch(error){
        console.log(error);
    }
    
}

function make_newsletter(html, recipes){
    const $ = cheerio.load(html);
    $("#recipe_image").attr("src", function(i, url){
        return recipes[i].image_url;
    });
    $("#recipe_readmore").attr("href", function(i, url){
        var recipe_url = process.env.db_addr + "/recipe/" + recipes[i].recipe_id;
        return recipe_url;
    });
    $("#recipe_desc").text(function(i, desc){
        return recipes[i].description;
    });

    $("#recipe_title").text(function(i, title){
        return recipes[i].title;
    });

    var new_html = $.html();
    fs.writeFileSync("src/scripts/newsletter-3.html", new_html);
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
    const recipes = await getTop5();
    var root = await path.dirname(require.main.filename);
    console.log(root);
    var html = fs.readFileSync('src/scripts/index.html');
    const res = await make_newsletter(html, recipes);
    const users = await getUsers();
    var usersTo = [];
    for (const user of users) {
        usersTo.push(user.email);
    }
    
    usersTo = await usersTo.join(", ");
    console.log(usersTo);
    email = {
        host: "smtp.gmail.com",
        port: 587,
        tls: {
            rejectUnauthorized: true,
            minVersion: "TLSv1.2"},
        auth: {
            user: process.env.email_user,
            pass: process.env.email_pass
        }
      }
      body = fs.readFileSync('src/scripts/newsletter-3.html')
      const sendemail = await sendMailer("Recipes for this week",body,usersTo);
    return 1;
}

main().then(()=>{});