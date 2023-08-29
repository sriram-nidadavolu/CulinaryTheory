const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true,
    },
    user_name:{
        type:String,
        required:true,
        validate: [validateUsername, 'Username length must be between 1 and 30 characters']
    },
    bio_info:{
        type:String,
        default:"",
        validate: [validateUserBio, 'Bio cannot be more than 200 characters']
    },
    profile_image:{
        type: String,
        default: "https://test-bucket-culinary.s3.amazonaws.com/3387e4c381f682b9f3b2104b0a4433f7.jpg"
    }
});

UserProfileSchema.methods.updateDoc = function(newData)
   {
    this.user_name = newData.user_name;
    this.bio_info = newData.bio_info || "";
    this.profile_image = newData.profile_image;
    }


UserProfileSchema.set('toJSON', {
    transform: function(doc, ret, options) {
      delete ret._id;
      return ret;
    }
  });

function validateUsername(username){
    return (username.length > 1 && username.length <= 30);
}

function validateUserBio(userbio){
    return (userbio.length <= 200);
}

module.exports = mongoose.model('userprofile', UserProfileSchema);