const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    like_id:{
        type:String,
        required: true
    },
    user_id:{
        type:String,
        required:true,
    },
    recipe_id:{
        type:String,
        required:true,
    },
    is_liked:{
        type:Boolean,
        required:true,
    },
});

likeSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret._id;
        return ret;
    }
    });

module.exports = mongoose.model("Like", likeSchema);
