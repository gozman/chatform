const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formId: {type: ObjectId, index:true},
  responderId: {type: ObjectId, index:true},
  response: {}
}, { timestamps: true });
