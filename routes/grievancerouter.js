const express = require("express");
const {
  getAllGrievances,
  createNewGrievance,
  updateGrievances,
  deleteGrievance,
} = require("../controllers/grievancecontroller");

const grievanceRouter = express.Router();

grievanceRouter.route("/").get(getAllGrievances).post(createNewGrievance);

grievanceRouter.route("/:id").put(updateGrievances).delete(deleteGrievance);

module.exports = grievanceRouter;
