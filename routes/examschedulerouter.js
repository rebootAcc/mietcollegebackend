const express = require("express");
const {
  getAllExamSchedules,
  createNewExamSchedule,
  deleteExamSchedule,
} = require("../controllers/examschedulecontroller");

const examScheduleRouter = express.Router();

examScheduleRouter.get("/", getAllExamSchedules);

examScheduleRouter.post("/", createNewExamSchedule);

examScheduleRouter.delete("/:id", deleteExamSchedule);

module.exports = examScheduleRouter;
