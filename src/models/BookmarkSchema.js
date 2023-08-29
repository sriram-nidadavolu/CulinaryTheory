const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true,
    },
    bookmark_id:{
        type:String,
        required:true,
    },
    recipe_id:{
        type:String,
        required:true,
    },
});

BookmarkSchema.set('toJSON', {
    transform: function(doc, ret, options) {
      delete ret._id;
      return ret;
    }
  });


module.exports = mongoose.model('Bookmark', BookmarkSchema);


