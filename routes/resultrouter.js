const express = require("express");
const {
  getAllResults,
  createNewResult,
  updateResult,
} = require("../controllers/resultcontroller");

const resultRouter = express.Router();

resultRouter.get("/", getAllResults);

resultRouter.post("/", createNewResult);

resultRouter.put("/:id", updateResult);

module.exports = resultRouter;
