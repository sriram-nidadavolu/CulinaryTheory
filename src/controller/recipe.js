const mongoose = require('mongoose')
const nanoid = require('nanoid');
const response = require('../helpers/response');
const request = require('../helpers/request');
const recipe = require('../models/recipe');
const aws = require('../helpers/aws');


const RecipeModel = mongoose.model('Recipes');
const Users = mongoose.model('User');

exports.create = function(req, res, next){
    console.log("In recipe create");

    validateRequest(req.body, function(result){

        if(!result){
            return response.sendBadRequest(res, "One of the fields is missing.")
        }
        else{
            if((req.body['is_public'] !== undefined && !req.body.is_public) && !req.session.user.prem){
                return response.sendForbidden(res, "Please subscribe to premium to save this recipe.");
            }
            req.body.recipe_id = nanoid();
            const newRecipe = new RecipeModel(req.body);
            const err = newRecipe.validateSync();
            if (err){
                return response.sendBadRequest(res, err.errors, err);
            }
            newRecipe.save(function(err, recipe){
                if (err) return response.sendBadRequest(res, err);
                response.sendCreated(res, "Successfully created the recipe", newRecipe.toJSON());
            });
        }
    });
}

exports.edit = function(req, res, next){
    console.log("In edit recipe.")
    if(!req.body.recipe_id){
        return response.sendBadRequest(res, "Recipe Id not in request.")
    }

    console.log(req.session.user);
    console.log(req.body.is_public);
    if((req.body['is_public'] !== undefined && !req.body.is_public) && !req.session.user.prem){
        return response.sendForbidden(res, "Please subscribe to premium to save this recipe.");
    }


    RecipeModel.findOne({recipe_id:req.body.recipe_id}).exec(function (err, recipe){
        if (err){
            console.log("There is some error in find one.");
            return next(err);
        }
        if (!recipe){
            console.log("Doc not found.")
            return response.sendBadRequest(res, "No document found for the given id.");
        }

        if (recipe.user_id != req.body.user_id) {
            return response.sendForbidden(res);
        }
        
        validateRequest(req.body, function(result){
            if(!result){
                console.log("In if")
                return response.sendBadRequest(res, "One of the fields is wrong/missing.")
            }
            else{
                recipe.updateDoc(req.body);
                recipe.save(function(err, recipe){
                if (err) return response.sendBadRequest(res, "Please check the data entered.", err);
                response.sendSuccess(res, "Successfully updated the doc.", recipe.toJSON());
            });
        }
    });
});
}



function validateRequest(reqBody, next){
    if(!reqBody.image_url || !reqBody.title || !reqBody.description || !reqBody.tags || !reqBody.steps || 
        !reqBody.ingredients || !reqBody.dietary_preferences || !reqBody.prep_time || !reqBody.cuisine
        ){
            return next(false);
        }
        return next(true);
}

function callback(res, err, docs, message, next){
    if(err){
        console.log("There is some error.");
        return next(err);
    }
    else if (!docs && typeof(docs) !== "undefined"){
        console.log("Docs not found.")
        return response.sendBadRequest(res, "Docs not found.");

    }
    else{
        return response.sendSuccess(res, message, docs);
    }

}

exports.search = function(req, res, next){
    console.log("In recipe search");

    var query = {}
    var sortQuery = {}

    if(req.query.dietary_preferences){
        query["dietary_preferences"] = req.query.dietary_preferences
    }

    if(req.query.prep_time){
        var filterTime = req.query.prep_time.split(",");
        console.log(`filter time ${filterTime}`);
        query["prep_time"] = {"$in" : filterTime}
    }
    if(req.query.sortBy && req.query.sortAsc){
        sortQuery[req.query.sortBy] = parseInt(req.query.sortAsc);
    }
    if (!req.query.searchBy && !req.query.searchFor){
        console.log("No search fields found.");
        return response.sendBadRequest(res, "Search fields not present.");
    }
    else{
        var searchFor = req.query.searchFor;
        var searchBy = req.query.searchBy;

        if(searchBy == "title"){
            query["title"] = {"$regex" : searchFor, $options: 'i'}
            query["is_public"] = true
            query["adminDelete"] = false
        }
        else if(searchBy == "tags"){
            const arraySearch = searchFor.split(" ")
            query["tags"] = {"$in": arraySearch}
            query["is_public"] = true
            query["adminDelete"] = false

        }
        else if(searchBy == "ingredients"){
            const arraySearch = searchFor.split(" ")
            if(arraySearch.length == 0){
                console.log("Ingredients array is null.")
                return response.sendBadRequest(res, "Ingredients array is null.")
            }
            else{

                const findBy = [];
                for(let i = 0; i < arraySearch.length; i++){
                    var ele = query
                    ele["ingredients.ingredient"] = {"$regex": arraySearch[i], "$options" : "i"};
                    ele["is_public"] = true;
                    ele["adminDelete"] = false;
                    findBy.push(ele);
                }
                query = {};
                query["$or"] = findBy;
            }
        

        }
        else{
            return response.sendBadRequest(res, "Wrong type of search.");
        }

        var limit = 6
        if(req.query.limit){
            limit = parseInt(req.query.limit)
        }
        var pageNumber = 0
        if(req.query.pageNumber){
            pageNumber = parseInt(req.query.pageNumber)
        }
        console.log(query);
        sortQuery["_id"] = 1;
        RecipeModel.find(query, function(err1, docs){
            if(err1){
                return next(err1);
            }
            else{
                RecipeModel.countDocuments(query, function(err2, count){
                    if(err2){
                        return next(err2);
                    }
                    else{
                        var data = {}
                        data['page'] = pageNumber;
                        data['total_count'] = count;
                        data['total_pages'] = Math.ceil(count / limit);
                        data['data'] = docs;
                        return response.sendSuccess(res, "Successfully fetched the recipes.",data);
                    }

                });
            }

        }).limit(limit).skip(pageNumber * limit).sort(sortQuery);
        
    }
}



exports.delete = function(req, res, next){

    if(!req.body.user_id || !req.body.recipe_id){
        console.log("No user id or recipe id present.");
        response.sendBadRequest(res, "No user id or recipe id present.")
    }
    else{
        if (req.session.user.role == "admin"){
            console.log("Admin will delete the recipe.")
            RecipeModel.findOneAndUpdate({recipe_id : req.body.recipe_id},{$set : {adminDelete : true} },{returnDocument: "after"}, function(err, doc){
                if (err) {
                    return next(err);
                }
                if (!doc) {
                    console.log("doc is null");
                    return response.sendNotFound(res, "Recipe not found");
                }
                console.log(doc);
                Users.findOne({user_id: doc.user_id}, function(err, user){
                    if(err){
                        console.log("error in finding user");
                        return next(err);
                    }

                    if(!user){
                        console.log(doc.user_id);
                        console.log("user not found");
                        return response.sendSuccess(res, "Successfully deleted the recipe");
                    }
                    console.log("user found");
                    var body = `Hello, \n Your recipe with title ${doc.title} has been removed for violating the community standards.\n\n The Culinary Theory Team`
                    user.sendEmail(false, "Recipe Removed for Violations", body, function(err){
                        console.log("sent an email to the user");
                        return response.sendSuccess(res, "Successfully deleted the recipe");
                    })
                });
                // var sucMessage = 'Successfully deleted the document by admin.';
                // return callback(res, err, doc, sucMessage);
            });
        }
        else{
            console.log("Deleting recipe by particular user.")
            RecipeModel.findOne({recipe_id: req.body.recipe_id}, function(err, recipe){
                if(err){
                    return next(err);
                }

                if(!recipe){
                    return response.sendNotFound(res, "No such recipe");
                }

                if(recipe.user_id != req.body.recipe_id){
                    return response.sendForbidden(res, "You do not have rights to delete this recipe");
                }

                RecipeModel.findOneAndDelete({user_id : req.body.user_id, recipe_id : req.body.recipe_id}, function(err, doc){
                    var sucMessage = 'Successfully deleted the document by user.';
                    return callback(res, err, doc, sucMessage, next);
                });
            });
        }

    }

}

exports.getSingleRecipe = function(req, res, next){
    if(!req.params.recipe_id){
        console.log("No recipe id present.");
        return response.sendBadRequest(res, "No recipe id present.")
    }
    else {
        console.log(req.params.recipe_id);
        RecipeModel.findOne({recipe_id : req.params.recipe_id, adminDelete:false}, function(err, recipe){

            if(!recipe){
                return callback(res, err, recipe, "No such recipe found.",next);
            }
            else{
                var user_id = "" ;
                if(req.session.user){
                    user_id = req.session.user.user_id;
                }
                var self_recipe = false;
                if(user_id === recipe.user_id){
                    self_recipe = true;
                }
                console.log(user_id);
                console.log(recipe.user_id);
                recipe = recipe.toJSON();
                recipe["self_recipe"] = self_recipe;
                if(recipe.is_public == false){
                    console.log(req.session.user);
                    if(req.session.user && req.session.user.user_id === recipe.user_id && req.session.user.prem){
                        return callback(res, err, recipe, "Successfully fetched the recipe.", next);
                    } else if (req.session.user && req.session.user.user_id === recipe.user_id){
                        return response.sendForbidden(res, "Please subscribe to premium to see your private recipes");
                    } else{
                        console.log("This recipe is private.")
                        return response.sendForbidden(res, "This recipe is private.");
                    }
                }
                else{
                    return callback(res, err, recipe, "Successfully fetched the recipe.", next);
                }
            }
        });
    }
}

exports.getRecipes = function(req, res, next){

    var pageNumber = 0;
    var limit = 6;
    if(req.query.pageNumber){
        pageNumber = parseInt(req.query.pageNumber);
    }
    if(req.query.limit){
        limit = parseInt(req.query.limit);
    }

    RecipeModel.find({adminDelete : false}, function(err1, docs){
        RecipeModel.countDocuments({adminDelete : false}, function(err2, count){
            if(err1){
                return next(err1);
            }
            else if(err2){
                return next(err2);
            }
            else if(typeof(docs) == "undefined" || !docs){
                return response.sendBadRequest(res, "No docs found.");
            }
            else{
                var data = {}
                data['page'] = pageNumber;
                data['total_count'] = count;
                data['total_pages'] = Math.ceil(count / limit);
                data['data'] = docs;
                return response.sendSuccess(res, "Successfully fetched the recipes.",data);
            }

        });
    }).limit(limit).skip(pageNumber * limit);

}


exports.checkRecipe = function(req, res, next){

    if(req.body.recipe_id || req.params.recipe_id){
        console.log(req.body.recipe_id || req.params.recipe_id);
        RecipeModel.findOne({recipe_id : req.body.recipe_id || req.params.recipe_id, adminDelete:false}, function(err, doc){
            if(err){
                return next(err);
            }
            if(!doc){
                return response.sendNotFound(res, "Recipe cannot be found.");
            }
            else{
                if(!doc.is_public && !doc.adminDelete){
                    return response.sendForbidden(res, "Recipe is not public.");
                }
                else{
                    return next();
                }
            }
    
        });
    } else {
        return response.sendBadRequest(res, "Recipe ID not present in request");
    }
}

exports.userRecipe = function(req, res, next){
    if(!req.params.user_id){
        return response.sendBadRequest(res, "No user id found.");
    }
    var limit = 6;
    if(req.query.limit){
        limit = parseInt(req.query.limit)
    }
    var pageNumber = 0
    if(req.query.pageNumber){
        pageNumber = parseInt(req.query.pageNumber)
    }
    var query = {user_id : req.params.user_id, adminDelete : false};
    if(!req.session.user.prem){
        query["is_public"] = true;
    }
    console.log(query);
    RecipeModel.find(query, function(err1, docs){

        RecipeModel.countDocuments(query, function(err2, count){
            if(err1){
                return next(err1);
            }
            else if(err2){
                return next(err2);
            }

            if(!docs){
                return response.sendNotFound(res, "No recipes by this user.");
            }
            else{
                var data = {}
                data['page'] = pageNumber;
                data['total_count'] = count;
                data['total_pages'] = Math.ceil(count / limit);
                data['data'] = docs;
                return response.sendSuccess(res, "Successfully fetched the recipes.", data);
            }

        });
        
    }).limit(limit).skip(pageNumber * limit);
}

exports.userRecipePublic = function(req, res, next){
    console.log("IN recipe public.")
    if(!req.params.query_user_id){
        return response.sendBadRequest(res, "No user id found.");
    }
    var limit = 6;
    if(req.query.limit){
        limit = parseInt(req.query.limit);
    }
    var pageNumber = 0;
    if(req.query.pageNumber){
        pageNumber = parseInt(req.query.pageNumber);
    }
    RecipeModel.find({user_id : req.params.query_user_id, is_public : true, adminDelete : false}, function(err1, docs){
        RecipeModel.countDocuments({user_id : req.params.query_user_id, is_public : true, adminDelete : false}, function(err2, count){
            console.log("In count docs single recipe")
            if(err1){
                return next(err1);
            }
            if(err2){
                return next(err2);
            }
            if(!docs){
                return response.sendNotFound(res, "No recipes by this user.");
            }
            else{
                var data = {}
                data['page'] = pageNumber;
                data['total_count'] = count;
                data['total_pages'] = Math.ceil(count / limit);
                data['data'] = docs;
                return response.sendSuccess(res, "Successfully fetched the recipes.", data);
            }

        });
        
    }).limit(limit).skip(pageNumber * limit);
}

exports.addLike = function(req, res, next){
    if (!req.body.recipe_id || req.body.is_liked==null){
        return response.sendBadRequest(res, "Required fields missing.");
    }
    else{
        RecipeModel.findOne({recipe_id : req.body.recipe_id}, function(err, recipe){

            if (err){
                return next(err);
            }
            if (!recipe){
                return response.sendBadRequest(res, "No recipe found with the given id.");
            }
            else{
                console.log(req.body.is_liked);
                console.log(!req.body.is_liked);
                if(req.body.is_liked){
                    console.log("here");
                    recipe.likes = recipe.likes + 1;
                }
                else{
                    console.log("disliking");
                    recipe.dislikes = recipe.dislikes + 1;
                }
                recipe.save(function(err, recipe){
                    if(err){
                        console.log(err);
                        return response.sendBadRequest(res,"Some error in updating likes/dislikes.", err);
                    }
                    else{
                        return response.sendSuccess(res, "Successfully updated the doc.");
                    }
                });
            }
        });
    }

}

exports.getMultipleRecipes = function(req, res, next){

    var ids = []
    if(req.query.recipe_ids){
        ids = req.query.recipe_ids.split(",");
    } else {
        return response.sendBadRequest(res, "No recipe IDs specified");
    }

    RecipeModel.find({recipe_id : {$in : ids}},{title:1, recipe_id:1}, function(err, docs){

        if(err){
            return next(err);
        }
        if(docs){
            var transformed_docs = {};
            docs.forEach(function(doc){
            transformed_docs[doc.recipe_id] = doc;
            });
            return response.sendSuccess(res, "Successfully fetched the recipes.", transformed_docs);
        }
        else{
            return response.sendSuccess(res, "Successfully fetched the recipes.", {});
        }
    });
}

exports.uploadImage = function(req, res, next){
    console.log(req.file.originalname.split('.')[1]);
    console.log(req.file.originalname.split('.'));
    var filename = `${req.file.filename}.${req.file.originalname.split('.')[1]}`;
    aws.s3_upload(req.file.path, filename, function(err, fileurl){
        if (err){
            console.log("Error uploading image");
            return next(err);
        }

        return response.sendSuccess(res, "Image successfully uploaded", {image_url: fileurl});
    })
}

exports.getBookmarkedRecipes = function(req, res, next){
    if (!req.bookmarks){
        return next(new Error("Bookmarks data not present"));
    }

    var recipe_ids = req.bookmarks;

    var limit = 6;
    var pageNumber = 0;
    if(req.query.pageNumber) {
        pageNumber = parseInt(req.query.pageNumber);
    }

    RecipeModel.find({recipe_id : {$in : recipe_ids}, adminDelete:false, is_public:true},{dietary_preferences:1, image_url:1, title:1, recipe_id:1, likes:1, dislikes:1, user_id:1}, function(err, docs){
        RecipeModel.countDocuments({recipe_id : {$in : recipe_ids}, is_public : true, adminDelete : false}, function(err2, count){

            if(err){
                return next(err);
            }

            if(err2){
                return next(err2);
            }
            if(!docs){
                return response.sendNotFound(res, "No bookmarked recipes by this user.");
            }
            else{
                var data = {}
                data['page'] = pageNumber;
                data['total_count'] = count;
                data['total_pages'] = Math.ceil(count / limit);
                data['data'] = docs;
                return response.sendSuccess(res, "Successfully fetched the recipes.", data);
            }
        }); 
    }).limit(limit).skip(pageNumber * limit);
}

exports.removeLike = function(req, res, next){
    if (!req.like){
        return response.sendBadRequest(res, "Required fields missing.");
    }
    else{
        RecipeModel.findOne({recipe_id : req.like.recipe_id}, function(err, recipe){

            if (err){
                return next(err);
            }
            if (!recipe){
                return response.sendBadRequest(res, "No recipe found with the given id.");
            }
            else{
                if(req.like.is_liked){
                    recipe.likes = recipe.likes - 1;
                }
                else{
                    recipe.dislikes = recipe.dislikes - 1;
                }
                recipe.save(function(err, recipe){
                    if(err){
                        console.log(err);
                        return response.sendBadRequest(res,"Some error in deleting likes/dislikes.", err);
                    }
                    else{
                        return response.sendSuccess(res, "Successfully updated the doc.");
                    }
                });
            }
        });
    }
}

