const express = require("express");
const {
  getAllNotices,
  createNewNotices,
  deleteNotice,
} = require("../controllers/noticecontroller");

const noticeRouter = express.Router();

noticeRouter.route("/").get(getAllNotices).post(createNewNotices);

noticeRouter.delete("/:id", deleteNotice);

module.exports = noticeRouter;
