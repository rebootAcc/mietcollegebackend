const { default: mongoose } = require("mongoose");
const { uploadFile, deleteFile } = require("../middlewares/cloudinary");
const { generateCustomId } = require("../middlewares/generateCustomId");
const Syllabus = require("../models/Syllabus");

exports.createNewSyllabus = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = verifyToken(token);
    if (!decodedToken || !decodedToken._doc.userId) {
      return res
        .status(404)
        .json({ message: "You are not authorizated for this operation" });
    }
    const { course, trade, semester, subject, fileName } = req.body;
    if (!course || !trade || !semester || !subject) {
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

    const syllabusId = await generateCustomId(
      Syllabus,
      "syllabusId",
      "syllabusId"
    );

    const syllabus = new Syllabus({
      syllabusId,
      course,
      trade,
      semester,
      subject,
      syllabusFile: {
        fileName,
        path: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });
    const newSyllabus = await syllabus.save();

    res.status(201).json({ ...newSyllabus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSyllabus = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = verifyToken(token);
    if (!decodedToken || !decodedToken._doc.userId) {
      return res
        .status(404)
        .json({ message: "You are not authorizated for this operation" });
    }
    const { id } = req.params;
    const requestedSyllabus = await Syllabus.findOne({
      $or: [{ syllabusId: id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : undefined }],
    });
    const { publicId } = requestedSyllabus.syllabusFile;
    const deleteResult = await deleteFile(publicId);
    if (deleteResult.result != "ok") {
      return res
        .status(400)
        .json({ message: "file deletation failed", success: false });
    }
    const deleted = await Syllabus.deleteOne(requestedSyllabus);
    if (deleted.deletedCount < 1) {
      return res
        .status(400)
        .json({ message: "Deletation failed", success: false });
    }
    res
      .status(200)
      .json({ message: "Syllabus deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSyllabuses = async (req, res) => {
  try {
    const {
      course,
      trade,
      semester,
      subject,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};
    if (course) filter.course = course;
    if (trade) filter.trade = trade;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;

    const skip = (page - 1) * limit;

    const syllabus = await Syllabus.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await Syllabus.countDocuments(filter);
    res.status(200).json({
      data: syllabus,
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
