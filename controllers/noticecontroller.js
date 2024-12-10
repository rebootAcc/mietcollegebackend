const { default: mongoose } = require("mongoose");
const { uploadFile, deleteFile } = require("../middlewares/cloudinary");
const { generateCustomId } = require("../middlewares/generateCustomId");
const Notice = require("../models/Notice");

exports.createNewNotices = async (req, res) => {
  try {
    const { title, department, trade, semester } = req.body;
    if (!title || !req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let uploadedFile = req.files.file;
    const uploadResult = await uploadFile(
      uploadedFile.tempFilePath,
      uploadedFile.mimetype
    );
    const noticeId = await generateCustomId(Notice, "noticeId", "noticeId");

    const newNotice = new Notice({
      noticeId,
      title,
      department,
      trade,
      semester,
      attachements: {
        file: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });
    const savedNotice = await newNotice.save();
    res.status(201).json({ message: "New notice created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllNotices = async (req, res) => {
  try {
    const {
      department,
      trade,
      semester,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};
    if (trade) filter.trade = trade;
    if (semester) filter.semester = semester;
    if (department) filter.department = department;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate); // Start date (>=)
      if (endDate) filter.createdAt.$lte = new Date(endDate); // End date (<=)
    }
    const skip = (page - 1) * limit;
    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip(skip) // Pagination: skip documents
      .limit(parseInt(limit, 10));

    const totalCount = await Notice.countDocuments(filter);

    res.status(200).json({
      data: notices,
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

exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findOne({
      $or: [
        { noticeId: id },
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : undefined },
      ],
    });
    if (!notice) {
      return res
        .status(404)
        .json({ message: "Notice not found", success: false });
    }
    await deleteFile(notice.attachements.publicId);
    await Notice.findByIdAndDelete(notice._id);
    res
      .status(200)
      .json({ message: "Notice deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
