const mongoose = require('mongoose');
const nanoid = require('nanoid');
const response = require('../helpers/response');
const bookmarkModel = mongoose.model('Bookmark');
const likemodel = mongoose.model('Like');
const commentModel = mongoose.model('comments');
const reportModel = mongoose.model('Report');
const userprofileModel = mongoose.model('userprofile');



exports.add_bookmark = function (req, res, next)  {
      if (!req.body.user_id || !req.body.recipe_id) {
        return response.sendBadRequest(res, 'Required fields missing');
      }
    
    
      bookmarkModel.findOne({user_id: req.body.user_id, recipe_id: req.body.recipe_id}).exec((err, bookmark)=>{
        if (err){
          return next(err);
        }
        
        if (bookmark){
          return response.sendBadRequest(res, "Already bookmarked!");
        }
        
        req.body.bookmark_id = nanoid();
        bookmark = new bookmarkModel(req.body);
        var err = bookmark.validateSync();
        
        if(err){
          return response.sendBadRequest(res, "Please check the data");
        }

        bookmark.save(function (err, bookmark){
          if (err){
            return next(err);
          }

          return response.sendSuccess(res, "Recipe bookmarked", bookmark.toJSON());
        });
      });

  };

exports.getbookmarks = function (req, res, next)  {
    if (!req.params.user_id) {
      return response.sendBadRequest(res, 'user_id is required');
    }

    // var limit = 6;
    // var pageNumber = 0
    // if(req.query.pageNumber){
    //   pageNumber = parseInt(req.query.pageNumber);
    // }

  // bookmarkModel.find({user_id: req.params.user_id}, function(err1, bookmarks){

  //   bookmarkModel.countDocuments({user_id: req.params.user_id}, function(err2, count){
  //       if(err1){
  //           return next(err1);
  //       }
  //       else if(err2){
  //           return next(err2);
  //       }

  //       if(!bookmarks){
  //           return response.sendNotFound(res, "No bookmarks found");
  //       } 
  //       else{
  //           var data = {}
  //           data['page'] = pageNumber;
  //           data['total_count'] = count;
  //           data['total_pages'] = Math.ceil(count / limit);
  //           if (bookmarks.length == 0){
  //             data['data'] = []
  //             return response.sendSuccess(res, "Successfully fetched the bookmarsk", data)
  //           } else{
  //             var bookmarks_arr = []
  //             bookmarks.forEach(function(bookmark){
  //               bookmarks_arr.push(bookmark.recipe_id);
  //             })
  //             data['data'] = bookmarks_arr;
  //             req.bookmarks = data
  //             next();
  //             // return response.sendSuccess(res, "Successfully fetched the recipes.", data);
  //           }
  //       }

  //   });
    
  // }).limit(limit).skip(pageNumber * limit);

  bookmarkModel.find({user_id: req.params.user_id}, function(err, bookmarks){
    if (err){
      return next(err);
    }

    if(!bookmarks){
      return response.sendNotFound(res, "No bookmarks found");
    } else {
      var bookmarks_arr = [];
      bookmarks.forEach(function(bookmark){
      bookmarks_arr.push(bookmark.recipe_id);
      })
      req.bookmarks = bookmarks_arr;
      return next();
    }
  });

}

exports.deletebookmark = function (req, res, next) {
  console.log('In delete bookmark');
  if (!req.body.user_id || !req.body.recipe_id) {
      return response.sendBadRequest(res, 'user_id and recipe id are required');
  }

  bookmarkModel.findOneAndDelete(({user_id:req.body.user_id,recipe_id:req.body.recipe_id}),function(err,doc){
    if (err) {
        return next(err);
      } 
    
    if (!doc) {
      return response.sendNotFound(res, "Bookmark not found.");
    }
    
    return response.sendSuccess(res, "Successfully deleted.", doc.toJSON());
});

};

exports.insertLikeDislike = function(req,res, next){

    
  
    if (!req.body.user_id|| !req.body.recipe_id || req.body.is_liked==null)
    {
     return response.sendBadRequest(res, "Required fields missing");
    } 

  
    likemodel.findOne({user_id:req.body.user_id, recipe_id:req.body.recipe_id}).exec((err,like)=>{
      if (err){
        return next(err);
      }
      
      if (like){
        return response.sendBadRequest(res, "Already liked/disliked."); 
      }

      req.body.like_id = nanoid();
      like = new likemodel(req.body);
      var err = like.validateSync();
      
      if(err){
        console.log(err);
        return response.sendBadRequest(res, "Please check the data");
      }

      like.save(function(err, like){
        if (err){
          return next(err);
        }

        return next();
      });
    
    });
  };



exports.countLikeDislike = function(req,res, next){
    
    if (!req.params.recipe_id){
      return response.sendBadRequest(res,"recipie id is missing or invalid");
    }

    likemodel.count(({recipe_id:req.params.recipe_id,is_liked:true}),function(err,likes){
        if (err) {
            return next(err);
        }
        likemodel.count(({recipe_id:req.params.recipe_id,is_liked:false}),function(err,dislikes){
            if (err) {
              return next(err);
            }
            return response.sendSuccess(res, "Success", {likes:likes, dislikes:dislikes});
        });  
    });
  };

exports.deleteLikedislike = function(req,res, next){
  

    if (!req.body.user_id || !req.body.recipe_id) 
    {
      return response.sendBadRequest(res, "Please check the userid or recipieid");
    }
    
  
    likemodel.findOneAndDelete(({user_id:req.body.user_id,recipe_id:req.body.recipe_id}),function(err,doc){
        if (err) {
            return next(err);
          } 
        
        if (!doc) {
          return response.sendNotFound(res);
        }
        else{
          req.like = doc.toJSON();
          return next();
          // return response.sendSuccess(res, "Successfully deleted.", doc.toJSON());
        }
    })
  };
   
  //Comments Insert Start
  exports.addComment = function(req,res, next){
    
    if (!req.body.user_id || !req.body.recipe_id ||!req.body.comment_text) {
      return response.sendBadRequest(res, 'Required fields missing');
    }
    
    req.body.comment_id = nanoid();
    
    comment = new commentModel(req.body);
        var err = comment.validateSync();
        
        if(err){
          return response.sendBadRequest(res, "Please check the data");
        }

        comment.save(function (err, comment){
          if (err){
            return next(err);
          }

          return response.sendSuccess(res, "Comment Saved", comment.toJSON());
        })
      };
  //Comments Insert End

  //Comments Get start (message has total number of pages)
  exports.getcomments = function (req, res, next)  {
    if (!req.params.recipe_id) {
      return response.sendBadRequest(res, 'recipe_id  is required');
    }

    var limit = 6;
    var pageNumber = 0;
    if(req.query.limit){
      limit = parseInt(req.query.limit);
    }
    if(req.query.pageNumber){
      pageNumber = parseInt(req.query.pageNumber);
    }
  
    commentModel.find({recipe_id: req.params.recipe_id}, function(err, comments){
      if (err){
          return next(err);
      }    
      commentModel.count({recipe_id: req.params.recipe_id}).exec(function(err, totalComments){
        if (err){
            return next(err);
           }
           data = {}
           data['page'] = pageNumber;
           data['total_count'] = totalComments;
           data['total_pages'] = Math.ceil(totalComments / limit);
           data['data'] = comments;
           return response.sendSuccess(res,"Successfully fetched comments." ,data);
      });
     }).sort({createdAt: -1, _id:1}).limit(limit).skip(pageNumber * limit);
  }
  //Comments Get end

  exports.add_reported_recipe = function (req, res, next)  {
    if (!req.body.user_id || !req.body.recipe_id) {
      return response.sendBadRequest(res, 'Reqired fields missing');
    }
  
  
    reportModel.findOne({user_id: req.body.user_id, recipe_id: req.body.recipe_id}).exec((err, report)=>{
      if (err){
        return next(err);
      }
      
      if (report){
        return response.sendBadRequest(res, "Already reported!");
      }
      
      req.body.report_id = nanoid();
      report = new reportModel(req.body);
      var err = report.validateSync();
      
      if(err){
        return response.sendBadRequest(res, "Please check the data");
      }

      report.save(function (err, report){
        if (err){
          return next(err);
        }

        return response.sendSuccess(res, "Recipe Reported", report.toJSON());
      });
    });

};

exports.getReports = function (req, res, next)  {

  var limit = 6;
  var pageNumber = 0;
  if(req.query.limit){
    limit = parseInt(req.query.limit);
  }
  if(req.query.pageNumber){
    pageNumber = parseInt(req.query.pageNumber);
  }
  
  reportModel.find({closed:false}, function(err, report){
    if (err){
        return next(err);
    }    
    reportModel.count({closed:false}).exec(function(err, totalreports){
      if (err){
             return next(err);
         }
         data = {}
         data['page'] = pageNumber;
         data['total_count'] = totalreports;
         data['total_pages'] = Math.ceil(totalreports / limit);
         data['data'] = report;
         return response.sendSuccess(res,"Successfully fetched reported recipes." ,data);
    
    }) 
   }).sort({createdAt: 1, _id:1}).limit(limit).skip(pageNumber * limit);
}

exports.closeReport = function(req, res, next) {
  if (!req.body.user_id) {
    return response.sendBadRequest(res, "No user id");
  }

  if (!req.body.report_id) {
    return response.sendBadRequest(res, "No report id");
  }

  if (!req.body.action) {
    return response.sendBadRequest(res, "Action not specified");
  }

  
  reportModel.findOne({report_id: req.body.report_id}).exec(function(err, report){
    if(err) {
      console.log("Error finding report")
      return next(err);
    }

    if(report.closed) {
      return response.sendBadRequest(res, "The report is already closed.");
    }

    if (req.body.action === "delete"){
      var query = {
        recipe_id: report.recipe_id,
        closed: false
      }

      var update = {
        $set : {
          action: req.body.action,
          closed: true,
          action_by: req.body.user_id
        }
      }

      reportModel.updateMany(query, update, function(err, result){
        if(err){
          return next(err);
        }

        if(!result){
          return response.sendBadRequest(res);
        }

        return response.sendSuccess(res, "Successfully closed the report", {closed_count: result.modifiedCount});

      })
    } else {
      report.action = req.body.action;
      report.closed = true;
      report.action_by = req.body.user_id;

      report.save(function(err, report){
        if(err) {
          console.log("Error closing the report");
          return next(err);
        }

        return response.sendSuccess(res, "Successfully closed the report", {closed_count: 1});
      });
    }
  });
}

//User Profile insert end
exports.createUserProfile = function(req,res, next){
    
  if (!req.body.user_id) {
    return response.sendBadRequest(res, 'User Id is missing.');
  }
  if(!req.body.user_name){
    return response.sendBadRequest(res, 'User Name is missing.');
  }

  userprofileModel.findOne({user_id: req.body.user_id}).exec(function(err, profileUser){

  if (err){
      return next(err);
  }

  if (profileUser){
    return response.sendBadRequest(res, "User Profile  already exist!");
  }
  
  var userProfile = new userprofileModel(req.body);
  var err = userProfile.validateSync();
  
  if(err){
    return response.sendBadRequest(res, err.message);
  }

  userProfile.save(function (err, userprofile){
    if (err){
      return next(err);
    }
    return response.sendSuccess(res, "User Profile Saved", userprofile.toJSON());
  })
})
}
//User Profile insert end 

//user profile get start
exports.getMyUserProfile= function (req, res, next)  {
  if (!req.body.user_id ) {
    return response.sendBadRequest(res, 'user_id is required');
  }
  userprofileModel.findOne({user_id: req.body.user_id}).exec(function(err, profileUser){
  if (err){
      return next(err);
  }

  if(!profileUser){
    var data = new userprofileModel({user_id:req.body.user_id, user_name: "The Culinary Theory"}).toJSON();
    data["is_premium"] = req.session.user.prem;
    return response.sendSuccess(res, "Success", data);
  }
  var data = profileUser.toJSON();
  data["is_premium"] = req.session.user.prem;
  return response.sendSuccess(res, "Success", data);
 });
}

// My
exports.getUserProfile = function (req, res, next)  {
  if (!req.params.query_user_id) {
    return response.sendBadRequest(res, 'user_id is required');
  }
  userprofileModel.findOne({user_id: req.params.query_user_id}).exec(function(err,profileUser){
  if (err){
      return next(err);
  }
  if(!profileUser){
    return response.sendNotFound(res, "No such user profile found.");
  }
  else{
    return response.sendSuccess(res, "Success", profileUser.toJSON());
  }

  
 });
}
//user profile get end

//User profile edit start
exports.editUserProfile = function(req, res, next){
  console.log("In edit profile.")
 
  if(!req.body.user_id){
      return response.sendBadRequest(res, "UserId is missing")
  }
  if(!req.body.user_name){
    return response.sendBadRequest(res, "User Name is missing")
  }

  userprofileModel.findOne({user_id:req.body.user_id}).exec(function (err,profileUser){
      if (err){
          console.log("There is some error in find one.");
          return next(err);
      }
      if (!profileUser){
          console.log("Profile not found");
          if(req.session.user){
            console.log("Logged in user. Calling create profile");
            return next();
          } else {
            return response.sendBadRequest(res, "No profile found for the given id.");
          }
      }
      
      validateUserProfileRequest(req.body, function(result){
          if(!result){
              console.log("In if")
              return response.sendBadRequest(res, "One of the fields is wrong/missing.")
          }
          else{
            profileUser.updateDoc(req.body);
            profileUser.save(function(err, profileUser){
              if (err) return response.sendBadRequest(res, "Please check the data entered.", err);
              return response.sendSuccess(res, "Successfully updated the doc.", profileUser.toJSON());
          });
      }
  });
});
}

function validateUserProfileRequest(reqBody, next){
  if (!reqBody.user_id || !reqBody.user_name){
          return next(false);
      }
      return next(true);
}
//User profile edit end


exports.isBookmarked = function(req, res, next){
  if(!req.params.user_id || !req.params.recipe_id){
    return response.sendBadRequest(res, "No user id found.");
  }
  else{
    bookmarkModel.findOne({user_id : req.params.user_id, recipe_id : req.params.recipe_id}, function(err, docs){

      if(err){
        return next(err);
      }
      if(!docs){
        return response.sendSuccess(res, "User has not bookmarked the recipe.", {bookmarked : false});
      }
      else{
        return response.sendSuccess(res, "This recipe has been bookmarked by the user", {bookmarked : true});
      }
    });
  }
}

exports.isLiked = function(req, res, next){
  if(!req.params.user_id || !req.params.recipe_id){
    return response.sendBadRequest(res, "No user id found.");
  }
  else{
    likemodel.findOne({user_id : req.params.user_id, recipe_id : req.params.recipe_id}, function(err, docs){

      if(err){
        return next(err);
      }
      if(!docs){
        return response.sendSuccess(res, "User has not liked/dislike the recipe.", {liked : false, disliked: false});
      }
      else{
        if(docs.is_liked){
          return response.sendSuccess(res, "User has liked this recipe.", {liked : true, disliked: false});
        }
        else{
          return response.sendSuccess(res, "User has not liked this recipe.", {liked : false, disliked: true});
        }
        
      }
    });
  }
}

exports.getUserNames = function(req, res, next){

  if(!req.query.users){
    return response.sendBadRequest(res, "No user ids given");
  }

 var user_ids = req.query.users;
 user_ids = user_ids.split(",");
//  console.log(user_ids);

 userprofileModel.find({user_id : {$in : user_ids}},{user_name:1, user_id:1, profile_image:1}, function(err, docs){

      if(err){
          return next(err);
      }

      if(docs){
        var transformed_docs = {};
        docs.forEach(function(doc){
          transformed_docs[doc.user_id] = doc;
        })
        return response.sendSuccess(res, "Successfully fetched the recipes.", transformed_docs)
      }
      else{
          return response.sendSuccess(res, "Successfully fetched the recipes.", {})
      }
  });
}

exports.checkReport = function(req, res, next){
  if(!req.body.report_id){
    response.sendBadRequest(res, "No report id given")
  }

  reportModel.findOne({report_id: req.body.report_id, closed: false}, function(err, report){
    if(err){
      console.log(err);
      return next(err);
    }

    if(!report){
      console.log("Report is already closed");
      return response.sendBadRequest(res, "The report is already closed");
    }

    return next();
  })

}


