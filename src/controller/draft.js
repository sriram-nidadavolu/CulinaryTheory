const mongoose = require('mongoose')
const nanoid = require('nanoid');
const response = require('../helpers/response');
const request = require('../helpers/request');

const DraftModel = mongoose.model('Drafts');

function callback(res, err, docs, message, next){
    if(err){
        console.log("There is some error.");
        return next(err);
    }
    else if (!docs && typeof(docs) !== "undefined"){
        console.log("Docs not found.")
        return response.sendBadRequest(res, "Doc not found.");

    }
    else{
        return response.sendSuccess(res, message, docs);
    }

}

exports.create = function(req, res, next){
    console.log("In draft create");
    req.body.draft_id = nanoid();
    const newDraft = new DraftModel(req.body);
    const err = newDraft.validateSync();
    if (err){
        console.log(err);
        return response.sendBadRequest(res, "Please check the data entered.", err);
    }
    newDraft.save(function(err, draft){
        if (err) return response.sendBadRequest(res, err);
        response.sendCreated(res, "Successfully created the draft", newDraft.toJSON());
    });
}

exports.edit = function(req, res, next){
    console.log("In edit draft")
    if(!req.body.draft_id){
        return response.sendBadRequest(res, "Draft Id not in request.")
    }

    DraftModel.findOne({draft_id:req.body.draft_id}).exec(function (err, draft){
        if (err){
            console.log("There is some error in find one.");
            return next(err);
        }
        if (!draft){
            console.log("Doc not found.")
            return response.sendBadRequest(res, "No document found for the given id.");
        }

        if (draft.user_id != req.body.user_id) {
            return response.sendForbidden(res);
        }
        
       
        draft.updateDoc(req.body);
        const err1 = draft.validateSync();
        if(err1){
            return response.sendBadRequest(res, "Please check the data entered.", err1)
        }
        draft.save(function(err2, draft){
        if (err2) return response.sendBadRequest(res, "Please check the data entered.", err2);
        response.sendSuccess(res, "Successfully updated the doc.", draft.toJSON());
    });
        
});
}

exports.delete = function(req, res, next){
    console.log("In delete draft");
    if(!req.body.user_id || !req.body.draft_id){
        console.log("No user id or draft id present.");
        response.sendBadRequest(res, "No user id or draft id present.")
    }
    else{
        
        console.log("Deleting draft by particular user.")
        DraftModel.findOneAndDelete({draft_id : req.body.draft_id}, function(err, doc){
            if(err){
                return next(err);
            }

            if(!doc){
                return response.sendBadRequest(res, "No such draft exists.");
            }

            if(doc.user_id != req.body.user_id){
                return response.sendForbidden(res, "You do not have rights to delete this");
            }
            var sucMessage = 'Successfully deleted the document by user.';
            return callback(res, err, doc, sucMessage, next);
        });

    }

}

exports.getDraft = function(req, res, next){

    if(!req.params.draft_id){
        return response.sendBadRequest(res, "No draft id found.");
    }
    if(!req.params.user_id){
        return response.sendBadRequest(res, "No user id found.");
    }
    else{
        DraftModel.findOne({draft_id : req.params.draft_id, user_id : req.params.user_id}, function(err, doc){

            if(err){
                return next(err);
            }

            if(!doc){
                return response.sendNotFound(res, "Draft not found.");
            }

            else{
                return response.sendSuccess(res, "Draft found with given id.",doc);
            }

        });
    }

}

exports.getUserDrafts = function(req, res, next){

    var pageNumber = 0;
    if(req.params.pageNumber){
        pageNumber = parseInt(req.params.pageNumber);
    }

    var limit = 5;
    if(req.params.limit){
        limit = parseInt(req.params.limit);
    }
    if(!req.params.user_id){
        return response.sendBadRequest(res, "No user id found.");
    }
    else{
        DraftModel.find({user_id : req.params.user_id}, function(err1, docs){
            if(err1){
                return next(err1);
            }
            else{
                DraftModel.countDocuments({user_id : req.params.user_id}, function(err2, count){
                    if(err2){
                        return next(err2);
                    }
                    else{
                        var data = {}
                        data['page'] = pageNumber;
                        data['total_count'] = count;
                        data['total_pages'] = Math.ceil(count / limit);
                        data['data'] = docs;
                        return response.sendSuccess(res, "Successfully fetched the drafts.",data);
                    }

                });
            }
    
        });
    }
}
