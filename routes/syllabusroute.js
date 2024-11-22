const express = require("express");
const {
  createNewSyllabus,
  getAllSyllabuses,
  deleteSyllabus,
} = require("../controllers/syllabuscontroller");

const syllabusRouter = express.Router();

syllabusRouter.post("/", createNewSyllabus);

syllabusRouter.get("/", getAllSyllabuses);

syllabusRouter.delete("/:id", deleteSyllabus);

module.exports = syllabusRouter;
