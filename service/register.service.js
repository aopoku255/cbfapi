const bcrypt = require("bcrypt");
const { Register } = require("../models"); // Adjust path as needed
const sendMail = require("../helpers/sendMail");
const mailBody = require("../helpers/mailBody");
const { generateToken } = require("../helpers/authtoken");
const models = require("../models");

async function registerUser(req, res) {
  try {
    const { email } = req.body;

    // Step 1: Check if user exists
    const user = await Register.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ status: "Failed", message: "User not found" });
    }

    // Step 2: Check if password is already set
    if (user.password) {
      return res.status(409).json({
        status: "Failed",
        message: "Password has already been generated for this user",
        email: user.email,
      });
    }

    // Step 3: Generate password
    const rawPassword = `${user.last_name}@CARISCA2025`;
    const capitalizedPassword =
      rawPassword.charAt(0).toUpperCase() + rawPassword.slice(1);

    // Step 4: Encrypt the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(capitalizedPassword, saltRounds);

    // Step 5: Update password and save
    user.password = hashedPassword;
    await user.save();

    // Step 6: Send password by email
    const mail = mailBody(user.first_name, capitalizedPassword);
    await sendMail(email, mail);

    // Final response
    res.status(200).json({
      status: "Success",
      message: "Password generated and updated successfully",
      email: user.email,
      generated: rawPassword, // For dev only – remove in production
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Step 1: Find the user
    const user = await Register.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // Step 2: Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = await generateToken({ id: user.id, email: user.email });

    // Step 3: Respond with success (token optional)
    return res.status(200).json({
      status: "Success",
      message: "Login successful",
      data: user,
      token: token, // Include token if needed
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getUserInfo(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "Failed", message: "User ID is required" });
    }

    const user = await Register.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "Failed", message: "User not found" });
    }

    res.status(200).json({
      status: "Success",
      message: "User details fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await models.Register.findAll({
      attributes: { exclude: ["password"] }, // optional: exclude sensitive fields
    });

    return res.status(200).json({
      status: "Success",
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserInfo,
  getAllUsers,
};
