const { uploadFile } = require("../middlewares/cloudinary");
const { generateCustomId } = require("../middlewares/generateCustomId");
const Result = require("../models/Results");
const Student = require("../models/Students");

exports.createNewResult = async (req, res) => {
  try {
    const { department, trade, semester, student } = req.body;
    if (!department || !semester || !trade || !student) {
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

    const resultId = await generateCustomId(Result, "resultId", "resultId");

    const newResult = new Result({
      resultId,
      department,
      trade,
      semester,
      student,
      resultFile: {
        fileName: "result-" + semester + "-" + department,
        path: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });

    const savedResult = await newResult.save();

    Student.findByIdAndUpdate(
      student,
      { $push: { results: savedResult._id } },
      { new: true }
    );
    res.status(201).json({ ...savedResult });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllResults = async (req, res) => {
  try {
    const {
      department,
      trade,
      semester,
      student,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (trade) filter.trade = trade;
    if (semester) filter.semester = semester;
    if (student) filter.student = student;

    const skip = (page - 1) * limit;

    const results = await Result.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("student")
      .exec();
    const totalCount = await Result.countDocuments(filter);
    res.status(200).json({
      data: results,
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

exports.updateResult = async (req, res) => {
  try {
    const { studentId } = req.body;
    const { id } = req.params;
    const requestedResult = await Result.findOne({
      $or: [{ resultId: id }, { _id: id }],
    });
    if (!requestedResult) {
      return res.status(404).json({ message: "Result not found" });
    }
    const oldStudent = await Student.findByIdAndUpdate(
      requestedResult.student,
      {
        $pull: { results: requestedResult._id },
      },
      { new: true }
    );
    if (!oldStudent) {
      return res.status(404).json({ message: "Something went wrong" });
    }
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $push: { results: requestedResult._id },
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Something went wrong" });
    }
    const updatedResult = await Result.findByIdAndUpdate(requestedResult._id, {
      student: studentId,
    });
    res.status(200).json({ ...updatedResult });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
