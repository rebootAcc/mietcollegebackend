const { generateCustomId } = require("../middlewares/generateCustomId");
const { generateToken, verifyToken } = require("../middlewares/jsonToken");
const User = require("../models/User");

exports.createNewUser = async (req, res) => {
  try {
    const { name, email, phone, password, designation } = req.body;
    if (!name || !email || !phone || !password || !designation) {
      return res.status(404).json({ message: `All fields are required` });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Phone already in use" });
    }
    const userId = await generateCustomId(User, "userId", "userId");
    const data = new User({
      userId,
      name,
      email,
      phone,
      password,
      designation,
    });
    const newUser = await data.save();
    const token = generateToken({
      ...newUser,
    });
    res.status(201).json({ ...newUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const { designation, userId } = req.query;

    const query = {};
    if (designation) query.designation = designation;
    if (userId) query.userId = userId;
    const users = await User.find(query);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginAsUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ ...user });

    res.status(200).json({ ...user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({
      $or: [{ userId }, { _id: userId }],
    });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the user",
      error: error.message,
    });
  }
};

exports.getUserByToken = async (req, res) => {
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
