const { generateCustomId } = require("../middlewares/generateCustomId");
const Payment = require("../models/Payments");

exports.createNewPayment = async (req, res) => {
  try {
    const { amount, student, semester } = req.body;
    if (!amount || !student || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const paymentId = await generateCustomId(Payment, "paymentId", "paymentId");
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
