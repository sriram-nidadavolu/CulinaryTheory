const mongoose = require('mongoose');
const nanoid = require('nanoid');

const Schema = mongoose.Schema;
const DraftSchema = new Schema({
    draft_id: {
        type: String,
        required: true
    },
    image_url: {type: String, default: ""},
    title: {type:String,required:true},
    description: {type: String, defaut: ""},
    tags: {type:[String], validate: [tagsValid, '{PATH} does not meet requirements.'], default:[]},
    steps: {
        type: [{
            step_no: {type:Number},
            step: {type:String}
    }],
        validate: [stepsValid, '{PATH} does not meet requirements.'],
        default: []
    },
    ingredients: {
        type: [{
            ingre_no: {type:Number},
            ingredient: {type:String},
            quantity: {type:String},
        }],
        validate: [ingredsValid, '{PATH} does not meet requirements.'],
        default: []
    },
    dietary_preferences: {type:String, default:""},
    prep_time: {
        type:String,
        enum: ['0-30', '30-60', '60-90', '>90', '']},
    cuisine: {type: String, default:""},
    is_public: {type:Boolean,default:true},
    user_id: {type:String, required:true}
},
    {timestamps: true}
);
function tagsValid(arr){
    flag = true;
    for(i in arr){
        flag = arr[i].length <= 30
        if(flag==false){
            break;
        }
    }
    return flag;
}

function stepsValid(arr){
    flag = true;
    for(i in arr){
        if(arr[i].step_no) {
            flag = arr[i].step !== undefined;
            if(flag==false){
                return false;
            }
        }
    }
    return true;
}

function ingredsValid(arr){
    flag = true;
    for(i in arr){
        flag = arr[i].ingredient.length <= 100
        if(flag==false){
            return false;
        }
    }
    return true;
}
DraftSchema.methods.updateDoc = function(newData){
    this.image_url = newData.image_url;
    this.title = newData.title;
    this.description = newData.description;
    this.tags = newData.tags;
    this.steps = newData.steps;
    this.ingredients = newData.ingredients;
    this.dietary_preferences = newData.dietary_preferences;
    this.prep_time = newData.prep_time;
    this.cuisine = newData.cuisine;
    this.is_public = newData.is_public;
}

DraftSchema.set('toJSON', {
    transform: function(doc, ret, options) {
      delete ret._id;
      return ret;
    }
  });

module.exports = mongoose.model('Drafts', DraftSchema);