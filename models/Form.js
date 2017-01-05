const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  ownerId: {type: ObjectId, index:true},
  smoochToken: String,
  fields: [{}],
  startTrigger: String,
  welcomeMessage: String,
  endTrigger: String,
  endMessage: String
}, { timestamps: true });
