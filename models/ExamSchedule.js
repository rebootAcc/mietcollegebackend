const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema(
  {
    examScheduleId: {
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
    examScheduleFile: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const ExamSchedule = mongoose.model("ExamSchedule", examScheduleSchema);

module.exports = ExamSchedule;
