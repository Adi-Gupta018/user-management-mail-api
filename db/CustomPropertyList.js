const mongoose = require('mongoose')

const CustomPropertyListSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    list_id :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'List',
        required:true,
    },
    defaultValue:{
        type:String
    }
});

CustomPropertyListSchema.index({title:1,list_id:1}, {unique:true});

const CustomPropertyList = mongoose.model('CustomPropertyList',CustomPropertyListSchema);
module.exports = CustomPropertyList;