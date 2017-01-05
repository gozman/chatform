const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const formSchema = new mongoose.Schema({
  ownerId: {type: ObjectId, index:true},
  smoochToken: String,
  fields: [{}],
  startTrigger: String,
  welcomeMessage: String,
  endTrigger: String,
  endMessage: String
}, { timestamps: true });

module.exports = Form;
