const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
  syllabusId: {
    type: String,
    required: true,
    unique: true,
  },
  course: {
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
  subject: {
    type: String,
    required: true,
  },
  syllabusFile: {
    type: Object,
    required: true,
  },
});

const Syllabus = mongoose.model("Syllabus", syllabusSchema);

module.exports = Syllabus;
