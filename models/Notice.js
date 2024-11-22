const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    noticeId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    department: {
      type: String,
    },
    trade: {
      type: String,
    },
    semester: {
      type: String,
    },
    attachements: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;
