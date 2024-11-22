const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  resultId: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  trade: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Student",
  },
  resultFile: {
    type: Object,
    required: true,
  },
});

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;