const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const responseSchema = new mongoose.Schema({
  formId: {type: ObjectId, index:true},
  responderId: {type: ObjectId, index:true},
  response: {}
}, { timestamps: true });

module.exports = Response;
