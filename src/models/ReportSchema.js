const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true,
    },
    report_id:{
        type:String,
        required:true,
    },
    recipe_id:{
        type:String,
        required:true,
    },
    reason:{
        type:String,
        required:true,
    },
    closed:{
        type:Boolean,
        required:true,
        default: false
    },
    action_by:{
        type:String,
    },
    action: {
        type: String,
        enum: ['delete', 'close']
    }
    },
    {timestamps: true}
);

ReportSchema.set('toJSON', {
    transform: function(doc, ret, options) {
      delete ret._id;
      return ret;
    }
  });


module.exports = mongoose.model('Report',ReportSchema);

