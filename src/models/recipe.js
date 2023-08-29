const mongoose = require('mongoose');
const nanoid = require('nanoid');

const Schema = mongoose.Schema;
const RecipeSchema = new Schema({
    recipe_id: {
        type: String,
        required: true,
        default: nanoid()
    },
    image_url: String,
    title: {type:String,required:true},
    description: String,
    tags: {
        type:[String],
        required: true,
        validate: 
        [
            {
                validator: tagsValid1,
                message: "Maximum length of tags must be at most 30" 
            },
            {
                validator: tagsValid2,
                message:"User must enter at least 5 and at most 10 tags"
            }
        ]
    },
    steps: {
        type: [{
            step_no: {type:Number,required:true},
            step: {type:String,required:true}
    }],
        validate: [
            {
                validator : stepsValid1,
                message: "Step Name is required if Step Number is entered"
            },
            {
                validator: stepsValid2,
                message: "User must enter at least 5 steps"
            }
        ],
        required: true
    },
    ingredients: {
        type: [{
            ingre_no: {type:Number,required:true},
            ingredient: {type:String,required:true},
            quantity: {type:String,required:true},
        }],
        required: true,
        validate: 
        [
            {
                validator: ingredsValid1,
                message: "Maximum length of ingredient must be less than 30" 
            },
            {
                validator: ingredsValid2,
                message:"User must enter at least 3 and at most 20 ingredients"
            }
        ]
    },
    dietary_preferences: {type:String, required:true, enum:["vegetarian", "nonvegetarian","contains egg"]},
    prep_time: {
        type:String,
        required:true,
        enum: ['0-30', '30-60', '60-90', '>90']
    },
    cuisine: String,
    is_public: {type:Boolean,default:true},
    user_id: {type:String, required:true},
    adminDelete : {type: Boolean, default : false},
    likes : {type: Number, default:0},
    dislikes : {type: Number, default:0}
},
    {timestamps: true}
);
function tagsValid1(arr){
    flag = true;
    for(i in arr){
        flag = arr[i].length <= 30
        if(flag==false){
            break;
        }
    }
    return flag;
}
function tagsValid2(arr){
    return arr.length >= 5 && arr.length <= 10;
}

function stepsValid1(arr){
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

function stepsValid2(arr){
    return arr.length >= 5 && arr.length <= 20;
}

function ingredsValid1(arr){
    flag = true;
    for(i in arr){
        flag = arr[i].ingredient.length <= 100
        if(flag==false){
            break;
        }
    }
    return flag;

}
function ingredsValid2(arr){
    return arr.length >= 3 && arr.length <= 35;
}

    
RecipeSchema.methods.updateDoc = function(newData){
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

RecipeSchema.set('toJSON', {
    transform: function(doc, ret, options) {
      delete ret._id;
      return ret;
    }
  });

module.exports = mongoose.model('Recipes', RecipeSchema);