const mongoose = require('mongoose');

const testcaseSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isSample: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Testcase', testcaseSchema);