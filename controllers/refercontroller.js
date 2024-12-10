const { default: mongoose } = require("mongoose");
const { generateCustomId } = require("../middlewares/generateCustomId");
const Referal = require("../models/Referral");
const Student = require("../models/Students");

exports.createNewRefer = async (req, res) => {
  try {
    const {
      refererName,
      refererPhone,
      refererCourse,
      refererDepartment,
      referee,
      remarks,
    } = req.body;
    if (
      !refererName ||
      !refererPhone ||
      !refererCourse ||
      !refererDepartment ||
      !referee
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const student = await Student.findOne({
      $or: [
        { studentId: referee },
        { _id: mongoose.Types.ObjectId.isValid(referee) ? referee : undefined },
      ],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const referalId = await generateCustomId(Referal, "referalId", "referalId");

    const newRefer = new Referal({
      referalId,
      refererName,
      refererPhone,
      refererCourse,
      refererDepartment,
      referee: student._id,
      remarks,
    });

    const savedRefer = await newRefer.save();
    res.status(201).json(savedRefer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReferals = async (req, res) => {
  try {
    const {
      refererName,
      refererPhone,
      refererCourse,
      refererDepartment,
      referee,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};
    if (refererName) filter.refererName = new RegExp(refererName, "i"); // Case-insensitive partial match
    if (refererPhone) filter.refererPhone = new RegExp(refererPhone, "i");
    if (refererCourse) filter.refererCourse = refererCourse;
    if (refererDepartment) filter.refererDepartment = refererDepartment;
    if (referee) filter.referee = referee;

    const skip = (page - 1) * limit;
    const referals = await Referal.find(filter)
      .sort({ createdAt: -1 }) // Sort by most recent
      .skip(skip) // Pagination
      .limit(parseInt(limit, 10));

    const totalCount = await Referal.countDocuments(filter);
    res.status(200).json({
      data: referals,
      meta: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReferal = async (req, res) => {
  try {
    const { id } = req.params;
    const referal = await Referal.findOne({
      $or: [
        {
          referalId: id,
          _id: mongoose.Types.ObjectId.isValid(id) ? id : undefined,
        },
      ],
    });
    if (!referal) {
      return res
        .status(404)
        .json({ message: "Referal not found", success: false });
    }
    await Referal.findByIdAndDelete(referal._id);
    res
      .status(204)
      .json({ message: "Referal deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
