const mongoose = require("mongoose");

const referalSchema = new mongoose.Schema(
  {
    referalId: {
      type: String,
      required: true,
      unique: true,
    },
    refererName: {
      type: String,
      required: true,
    },
    refererPhone: {
      type: String,
      required: true,
    },
    refererCourse: {
      type: String,
      required: true,
    },
    refererDepartment: {
      type: String,
      required: true,
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Student",
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

const Referal = mongoose.model("Referal", referalSchema);

module.exports = Referal;
