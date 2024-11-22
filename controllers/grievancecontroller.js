const { uploadFile, deleteFile } = require("../middlewares/cloudinary");
const { generateCustomId } = require("../middlewares/generateCustomId");
const Grievances = require("../models/Grievance");
const Student = require("../models/Students");

exports.createNewGrievance = async (req, res) => {
  try {
    const { studentId, remarks, description, status, type } = req.body;
    if (studentId) {
      const student = await Student.findOne({
        $or: [{ studentId: studentId }, { _id: studentId }],
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
    }
    let uploadResult;
    if (req.files && Object.keys(req.files).length > 0) {
      let uploadedFile = req.files.file;
      uploadResult = await uploadFile(
        uploadedFile.tempFilePath,
        uploadedFile.mimetype
      );
    }

    const grievanceId = await generateCustomId(
      Grievances,
      "grievanceId",
      "grievanceId"
    );

    const newGrievance = new Grievances({
      grievanceId,
      studentId,
      remarks,
      description,
      status,
      type,
      attachment: {
        path: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });

    const savedGrievance = await newGrievance.save();
    res.status(201).json({ ...savedGrievance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllGrievances = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Add status filter if provided
    if (status) filter.status = status;

    // Add date range filter if startDate or endDate is provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate); // Start date (>=)
      if (endDate) filter.createdAt.$lte = new Date(endDate); // End date (<=)
    }

    const skip = (page - 1) * limit;

    // Fetch grievances based on filters with pagination and sorting
    const grievances = await Grievances.find(filter)
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip(skip) // Pagination: skip documents
      .limit(parseInt(limit, 10)); // Pagination: limit documents

    // Count total documents matching the filter
    const totalCount = await Grievances.countDocuments(filter);

    res.status(200).json({
      data: grievances,
      meta: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching grievances:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateGrievances = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const grievance = await Grievances.findOne({
      $or: [{ grievanceId: id }, { _id: id }],
    });
    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }
    if (status) grievance.status = status;
    const updatedGrievance = await grievance.save();
    res.status(200).json(updatedGrievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const grievance = await Grievances.findOne({
      $or: [{ grievanceId: id }, { _id: id }],
    });
    if (!grievance) {
      return res
        .status(404)
        .json({ message: "Grievance not found", success: false });
    }
    if (grievance.attachment.publicId) {
      await deleteFile(grievance.attachment.publicId);
    }
    await Grievances.deleteOne(grievance);
    res.status(200).json({ message: "Grievance deleted", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
