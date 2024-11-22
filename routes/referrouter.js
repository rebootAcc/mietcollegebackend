const express = require("express");
const {
  getAllReferals,
  createNewRefer,
  deleteReferal,
} = require("../controllers/refercontroller");

const referRouter = express.Router();

referRouter.route("/").get(getAllReferals).post(createNewRefer);

referRouter.delete("/:id", deleteReferal);

module.exports = referRouter;
