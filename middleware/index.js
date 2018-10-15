/* MIDDLEWARES */
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};


middlewareObj.checkCampgroundOwnership = function(req, res, next){
    //is user logged in ?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){
                req.flash("error", "Campground not found :(");
                res.redirect("back");
            }
            else{
                //does user own the campground?
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    req.campground = foundCampground;
                    next();
                }
                else{
                    req.flash("error", "You don't have the permissions to do the following action");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        });
    }
    //otherwise, redirect       
    else{
        //if not, redirect somewhere
        req.flash("error", "You must be logged in order to do the following action");
        res.redirect("back");
    }
}


middlewareObj.checkCommentOwnership = function(req, res, next){
    //is user logged in ?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Sorry, that comment does not exist!");
                res.redirect("/campgrounds");
            }
            else{
                //does user own the campground?
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    req.comment = foundComment;
                    next();
                }
                else{
                    req.flash("error", "You don't have the permissions to do the following action");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        });
    }
    //otherwise, redirect back
    else{
        //if not, redirect somewhere
        req.flash("error", "You must be logged in order to do the following action");
        res.redirect("back");
    }  
}


middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in order to do the following action");
    res.redirect("/login");
}


module.exports = middlewareObj;