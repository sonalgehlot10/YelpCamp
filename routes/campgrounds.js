var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");


//show all campgrounds
router.get("/",function(req,res){
	Campground.find({},function(err,allCampgrounds){
		if(err){
			console.log(err);
		}else{
			res.render("campgrounds/index",{campgrounds : allCampgrounds});
		}
	});
});


//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
	var price = req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, price: price, description: desc, author:author}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

//show form to create new campground
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
})

//shows more info about one campground
router.get("/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
            res.redirect("back");
		}else{
			console.log(foundCampground)
			res.render("campgrounds/show",{campground : foundCampground});
		}
	})
});

//Edit campground route
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
		Campground.findById(req.params.id,function(err,foundCampground){
			res.render("campgrounds/edit",{campground:foundCampground});
		});
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", function(req, res){
    var newData = {name: req.body.name, image: req.body.image, price: req.body.price, description: req.body.desc};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});

//Destroy campground route
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/campgrounds")
		}else{
			res.redirect("/campgrounds")
		}
	})
});

module.exports = router;
