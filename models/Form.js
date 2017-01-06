const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const formSchema = new mongoose.Schema({
  ownerId: {type: ObjectId, index:true},
  name: String,
  smoochToken: String,
  fields: [{}],
  startTrigger: String,
  startMessage: String,
  endTrigger: String,
  endMessage: String,
  responseCount: Number,
  smoochWebHookId: String
}, { timestamps: true });

const Form = mongoose.model('Form', formSchema);
module.exports = Form;
