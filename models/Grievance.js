const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    grievanceId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Student",
    },
    remarks: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    attachment: {
      type: Object,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Grievances = mongoose.model("grievance", grievanceSchema);

module.exports = Grievances;
