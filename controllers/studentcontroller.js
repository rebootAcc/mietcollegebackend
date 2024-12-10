const { default: mongoose } = require("mongoose");
const { uploadFile, deleteFile } = require("../middlewares/cloudinary");
const { generateCustomId } = require("../middlewares/generateCustomId");
const { generateToken, verifyToken } = require("../middlewares/jsonToken");
const Result = require("../models/Results");
const Student = require("../models/Students");

exports.createNewStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      alternateNumber,
      department,
      trade,
      semester,
      registrationNumber,
      collegeId,
      address,
      password,
    } = req.body;
    if (
      !name ||
      !email ||
      !phone ||
      !department ||
      !trade ||
      !semester ||
      !registrationNumber ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingStudent = await Student.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if (existingStudent) {
      return res.status(400).json({ message: "Email or Phone already in use" });
    }

    const studentId = await generateCustomId(Student, "studentId", "studentId");

    const data = new Student({
      studentId,
      name,
      email,
      phone,
      department,
      alternateNumber,
      trade,
      semester,
      registrationNumber,
      collegeId,
      address,
      password,
    });
    const newStudent = await data.save();
    const token = generateToken({
      ...newStudent,
    });
    res.status(201).json({ ...newStudent, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginAsStudents = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const student = await Student.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!student || !(await student.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ ...student });

    res.status(200).json({ ...student, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("files are required");
    }

    const student = await Student.findOne({
      $or: [
        { studentId: id },
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : undefined },
      ],
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.profilePicture) {
      await deleteFile(student.profilePicture.publicId);
    }
    let uploadedFile = req.files.file;
    const uploadResult = await uploadFile(
      uploadedFile.tempFilePath,
      uploadedFile.mimetype
    );
    student.profilePicture = {
      path: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
    const updatedStudent = await student.save();
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({
      $or: [
        { studentId: id },
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : undefined },
      ],
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const updatedStudent = await Student.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({
      $or: [
        { studentId: id },
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : undefined },
      ],
    });
    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found", success: false });
    }
    const deletePromises = [];

    if (student.profilePicture.publicId) {
      deletePromises.push(deleteFile(student.profilePicture.publicId));
    }
    if (student.results.length > 0) {
      deletePromises.push(Result.deleteMany({ student: student._id }));
    }

    deletePromises.push(Student.deleteOne({ _id: student._id }));

    await Promise.all(deletePromises);

    return res
      .status(200)
      .json({ message: "Student deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentByToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(404).json({ message: "Invalid token" });
    }
    res.status(200).json(decodedToken._doc);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const { department, trade, semester, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (trade) filter.trade = trade;
    if (semester) filter.semester = semester;
    if (department) filter.department = department;

    const skip = (page - 1) * limit;
    const students = await Student.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("results")
      // .populate("payments")
      .exec();
    const totalCount = await Student.countDocuments(filter);
    res.status(200).json({
      data: students,
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

exports.searchStudent = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) {
      return res.status(200).json([]);
    }
    const skip = (page - 1) * limit;
    const searchCriteria = {
      $or: [
        { studentId: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { alternateNumber: { $regex: q, $options: "i" } },
        { registrationNumber: { $regex: q, $options: "i" } },
        { collegeId: { $regex: q, $options: "i" } },
      ],
    };
    const students = await Student.find(searchCriteria)
      .skip(skip)
      .limit(limit)
      .populate("results")
      // .populate("payments")
      .exec();
    const totalCount = await Student.countDocuments(searchCriteria);
    res.status(200).json({
      data: students,
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
