var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var middleware = require("../middleware");



/* LANDING PAGE */
router.get("/", function(req ,res){
    res.render("landing");
});


/* SHOW REGISTER FORM */
router.get("/register", function(req, res) {
   res.render("register", {page: "register"}); 
});


/* HANDLE SIGN UP LOGIC */
router.post("/register", function(req, res) {
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar || "https://cdn.iconscout.com/icon/free/png-256/avatar-375-456327.png"
        });
        
    if(req.body.adminCode === 'ShakedOfirWebDev'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message)
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp, " + user.username);
            res.redirect("/campgrounds");
        });
    }); 
});


/* SHOW LOGIN FORM */
router.get("/login", function(req, res) {
    res.render("login", {page: "login"});
});


/* HANDLE LOGIN LOGIC */
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: "Invalid username or password.",
        successFlash: "Welcome!"
    }), function(req, res) {
});


/* LOGOUT ROUTE */
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/campgrounds");
});


/* USER'S PROFILE */
router.get("/users/:user_id", function(req, res) {
    User.findById(req.params.user_id, function(err, foundUser){
        if(err){
            req.flash("error", "Something went wrong :(");
            return res.redirect("/campgrounds");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err, foundCampgrounds){
            if(err){
                req.flash("error", "Something went wrong :(");
                return res.redirect("/campgrounds");
            }
            res.render("users/show", {user: foundUser, campgrounds: foundCampgrounds});
        });
    });
});


/* EDIT - edits specific user */
router.get("/users/:user_id/edit", middleware.isLoggedIn, function(req, res) {
    User.findById(req.params.user_id, function(err, foundUser) {
        //check if a campground exists, if not throw an error
        if(err || !foundUser){
            req.flash("error", "Sorry, that user does not exist!");
            return res.redirect("back");
        }
        
        res.render("users/edit", {user: foundUser});
    });
});


/* UPDATE - update specific user */
router.put("/users/:user_id", middleware.isLoggedIn, function(req, res){
   // find and update the correct user
   User.findByIdAndUpdate(req.params.user_id, req.body, function(err, updatedUser){
       if(err || !updatedUser){
           console.log(err);
           res.redirect("/campgrounds");
       }
       else{
            //redirect show page
           res.redirect("/users/" + req.params.user_id);
       }
   });
});



module.exports = router;