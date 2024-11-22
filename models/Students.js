const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    alternateNumber: {
      type: String,
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
    registrationNumber: {
      type: String,
      required: true,
    },
    collegeId: {
      type: String,
    },
    address: {
      type: String,
    },
    payments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Payment",
      default: [],
    },
    profilePicture: {
      type: Object,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    results: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Result",
      default: [],
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
