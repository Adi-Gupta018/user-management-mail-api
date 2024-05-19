const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  customProperties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomPropertyList'
    }
  ]
});
const List = mongoose.model('List', listSchema);
module.exports = List;
