// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   list: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'List',
//     required: true
//   },
//   customProperties: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'UserCustomProperty' // Optional reference if separate table is used
//     }
//   ]
// });
// const User = mongoose.model('User', userSchema);
// module.exports = User;
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  customProperties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCustomProperty' // Optional reference if separate table is used
    }
  ]
}, 
{ index: { email: 1, list: 1 }, unique: true }
); // Composite index

const User = mongoose.model('User', userSchema);
module.exports = User;
