const express = require("express");
const {
  getAllUser,
  createNewUser,
  getUserByToken,
  deleteUser,
  loginAsUser,
} = require("../controllers/usercontroller");
const userRouter = express.Router();

userRouter.route("/").get(getAllUser).post(createNewUser);

userRouter.post("/login", loginAsUser);

userRouter.get("/user", getUserByToken);

userRouter.delete("/:userId", deleteUser);

userRouter.get("/token", getUserByToken);

module.exports = userRouter;
