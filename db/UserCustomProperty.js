const mongoose = require('mongoose');

const userCustomPropertySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  custom_property_list_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomPropertyList',
    required: true
  },
  value: {
    type: String
  }
}, {
  unique: true, // Ensure unique combination of user_id and custom_property_list_id
});

const UserCustomProperty = mongoose.model('UserCustomProperty', userCustomPropertySchema);
module.exports = UserCustomProperty
