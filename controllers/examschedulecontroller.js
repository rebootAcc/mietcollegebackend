const { uploadFile, deleteFile } = require("../middlewares/cloudinary");
const { generateCustomId } = require("../middlewares/generateCustomId");
const ExamSchedule = require("../models/ExamSchedule");

exports.createNewExamSchedule = async (req, res) => {
  try {
    const { department, trade, semester, fileName } = req.body;
    if (!department || !semester || !trade) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("files are required");
    }
    let uploadedFile = req.files.file;

    const uploadResult = await uploadFile(
      uploadedFile.tempFilePath,
      uploadedFile.mimetype
    );

    const examScheduleId = await generateCustomId(
      ExamSchedule,
      "examScheduleId",
      "examScheduleId"
    );

    const newExamSchedule = new ExamSchedule({
      examScheduleId,
      department,
      trade,
      semester,
      examScheduleFile: {
        fileName: fileName || "exam-schedule-" + semester + "-" + department,
        path: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });

    const savedExamSchedule = await newExamSchedule.save();
    res.status(201).json({ ...savedExamSchedule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllExamSchedules = async (req, res) => {
  try {
    const {
      trade,
      semester,
      department,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (trade) filter.trade = trade;
    if (semester) filter.semester = semester;
    if (department) filter.department = department;

    const skip = (page - 1) * limit;

    const examSchedules = await ExamSchedule.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      

    const totalCount = await ExamSchedule.countDocuments(filter);

    res.status(200).json({
      data: examSchedules,
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

exports.deleteExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const requestedExamSchedule = await ExamSchedule.findOne({
      $or: [{ syllabusId: id }, { _id: id }],
    });
    const { publicId } = requestedExamSchedule.examScheduleFile;
    const deleteResult = await deleteFile(publicId);
    if (deleteResult.result != "ok") {
      return res
        .status(400)
        .json({ message: "file deletation failed", success: false });
    }
    const deleted = await ExamSchedule.deleteOne(requestedSyllabus);
    if (deleted.deletedCount < 1) {
      return res
        .status(400)
        .json({ message: "Deletation failed", success: false });
    }
    res
      .status(200)
      .json({ message: "Exam Schedule deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
