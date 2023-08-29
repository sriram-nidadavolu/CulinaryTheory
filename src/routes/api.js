const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const response = require('../helpers/response');
const auth = require('../controller/auth');
const users = require('../controller/users');
const recipe = require('../controller/recipe')
const draft = require('../controller/draft');
const UserInteraction =require ("../controller/UserInteraction")
const subscription = require("../controller/subscription");

const multer = require('multer');
const upload = multer({dest: '../uploads/'})


const routes  = express.Router();

routes.get('/index', auth.ensureAuthenticated, (req, res) => {
    res.send("You have access!");
})

routes.get('/', (req, res) => {

    res.status(200).json({ message: 'Ok' });
});

routes.get('/login/test', (req, res) => {
    res.sendFile("set_password.html", {root: path.join(path.dirname(__dirname), "views")})
  });

routes.post('/login', auth.authenticate)
routes.post('/register', users.create);
routes.get('/logout', auth.signOut);
routes.post('/auth/resetemail', auth.resetPasswordEmail);

routes.post('/auth/resetpassword', auth.validateResetToken, auth.resetPassword, auth.deleteToken);
routes.post('/auth/updatepassword', auth.ensureAuthenticated, auth.ensureOwner, auth.updatePassword);
routes.get('/auth/isloggedin', auth.ensureAuthenticated, function(req, res){
    response.sendSuccess(res, "Logged in", {logged_in: true});
});

routes.get('/admin/getuser', auth.ensureRoot, users.getUser);
routes.post('/admin/updaterole', auth.ensureRoot, auth.changeRole);
routes.get('/issuperadmin', auth.ensureRoot, function(req, res){
  response.sendSuccess(res, "Logged in", {superadmin: true});
});

routes.post('/gensub', auth.ensureAuthenticated, subscription.generateSubscription);
routes.post('/subscribe', auth.ensureAuthenticated, subscription.subscribe, subscription.sendSubEmail);
routes.post('/cancelsub', auth.ensureAuthenticated, subscription.cancelSubscription, subscription.sendSubEmail);
routes.get('/getsub', auth.ensureAuthenticated, subscription.getSubscription);
routes.get('/ispremium', subscription.isPremiumUser);

routes.post('/subscribemail', auth.ensurePremium, subscription.subscribeEmail);
routes.get('/isemailsub', auth.ensureAuthenticated, subscription.isEmailSub);
routes.post('/unsubemail', auth.ensurePremium, subscription.unsubEmail);

routes.post('/bookmark', auth.ensureAuthenticated, recipe.checkRecipe, UserInteraction.add_bookmark);
routes.get('/bookmarks', auth.ensureAuthenticated, UserInteraction.getbookmarks, recipe.getBookmarkedRecipes);
routes.delete('/bookmark/delete', auth.ensureAuthenticated, UserInteraction.deletebookmark);
routes.get('/isbookmarked/:recipe_id', auth.ensureAuthenticated, recipe.checkRecipe, UserInteraction.isBookmarked);

routes.post('/like', auth.ensureAuthenticated, recipe.checkRecipe, UserInteraction.insertLikeDislike, recipe.addLike);
routes.get('/likes/:recipe_id', recipe.checkRecipe, UserInteraction.countLikeDislike);
routes.delete('/like/delete', auth.ensureAuthenticated, UserInteraction.deleteLikedislike, recipe.removeLike);
routes.get('/isliked/:recipe_id', auth.ensureAuthenticated, UserInteraction.isLiked);

routes.post('/comment',auth.ensureAuthenticated, users.ensureAccountAge, recipe.checkRecipe, UserInteraction.addComment);
routes.get('/comments/:recipe_id',auth.ensureAuthenticated, recipe.checkRecipe, UserInteraction.getcomments);

routes.post('/report',auth.ensureAuthenticated, users.ensureAccountAge, recipe.checkRecipe, UserInteraction.add_reported_recipe);
routes.get('/admin/reports', auth.ensureAdmin, UserInteraction.getReports);
routes.post('/admin/report/close', auth.ensureAdmin, UserInteraction.closeReport);

routes.post('/profile/create', auth.ensureAuthenticated, UserInteraction.createUserProfile);
routes.post('/profile/edit', auth.ensureAuthenticated, UserInteraction.editUserProfile, UserInteraction.createUserProfile);
routes.get('/myprofile', auth.ensureAuthenticated, UserInteraction.getMyUserProfile);
routes.get('/profile/:query_user_id', auth.ensureAuthenticated, users.checkUser, UserInteraction.getUserProfile);
routes.get('/usernames', UserInteraction.getUserNames);

routes.post("/imageupload", upload.single('image'), auth.ensureAuthenticated, recipe.uploadImage);

routes.post('/recipe/create', auth.ensureAuthenticated, recipe.create);
routes.post('/recipe/edit', auth.ensureAuthenticated, recipe.edit);
routes.post('/recipe/delete', auth.ensureAuthenticated, recipe.delete);
routes.get("/recipe/search", recipe.search);
routes.delete("/admin/recipe/delete", auth.ensureAdmin, UserInteraction.checkReport, recipe.delete);
routes.get("/recipe/myrecipes", auth.ensureAuthenticated, recipe.userRecipe);
routes.get("/recipe/user/:query_user_id", auth.ensureAuthenticated, users.checkUser, recipe.userRecipePublic);
routes.get("/recipe/:recipe_id", recipe.getSingleRecipe);
routes.get('/recipes', recipe.getMultipleRecipes);

routes.post('/draft/create', auth.ensurePremium, draft.create);
routes.post('/draft/edit', auth.ensurePremium, draft.edit);
routes.post('/draft/delete', auth.ensurePremium, draft.delete);
routes.get('/draft/:draft_id', auth.ensurePremium, draft.getDraft);
routes.get('/drafts/mydrafts', auth.ensurePremium, draft.getUserDrafts);


routes.use(function(req, res) {
  response.sendNotFound(res);
});


module.exports = routes;
