const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
    comment_id:{
        type:String,
        required: true,
    },
    user_id:{
        type:String,
        required:true,
    },
    recipe_id:{
        type:String,
        required:true,
    },
    comment_text:{
        type:String,
        required:true,
    },
},
    {timestamps:true}
);

commentsSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret._id;
        return ret;
    }
    });

module.exports = mongoose.model("comments", commentsSchema);
