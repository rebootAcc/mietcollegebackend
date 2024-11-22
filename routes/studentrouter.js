const express = require("express");
const {
  getAllStudents,
  createNewStudent,
  loginAsStudents,
  searchStudent,
  getStudentByToken,
  addProfilePicture,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentcontroller");

const studentRouter = express.Router();

studentRouter.get("/", getAllStudents);

studentRouter.post("/", createNewStudent);

studentRouter.post("/login", loginAsStudents);

studentRouter.get("/search", searchStudent);

studentRouter.get("/token", getStudentByToken);

studentRouter.put("/profile-picture/:id", addProfilePicture);

studentRouter.put("/:id", updateStudent);

studentRouter.delete("/:id", deleteStudent);

module.exports = studentRouter;
