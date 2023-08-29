const express = require("express");
const response = require("../helpers/response");
const routes = express.Router();
const auth = require("../controller/auth");
const path = require("path");

// routes.use('/home', (req, res) => {
//     res.send("The Culinary Theory");
// });
routes.get("/auth/reset/:token", auth.validateResetToken, auth.renderResetPage);
routes.get("/login", (req, res) => {
  if (req.session.user) {
    res.send("You are logged in!");
  } else {
    res.sendFile("login.html", {
      root: path.join(path.dirname(__dirname), "views"),
    });
  }
});

routes.get("/managesubscription", (req, res) => {
  res.sendFile("manage_subscription.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/subscribe", (req, res) => {
  res.sendFile("subscribe.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/admindashboard", (req, res) => {
  res.sendFile("admin_dashboard.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/superadmin", (req, res) => {
  res.sendFile("superAdmin.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/home", (req, res) => {
  res.sendFile("home.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/myprofile", (req, res) => {
  res.sendFile("accountViewPage.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/about", (req, res) => {
  res.sendFile("aboutus.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/recipe", (req, res) => {
  res.sendFile("recipeViewPage.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/createrecipe", (req, res) => {
  res.sendFile("createRecipe.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/editrecipe", (req, res) => {
  res.sendFile("editRecipe.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

routes.get("/profileview", (req, res) => {
  res.sendFile("profileViewPage.html", {
    root: path.join(path.dirname(__dirname), "views"),
  });
});

module.exports = routes;
