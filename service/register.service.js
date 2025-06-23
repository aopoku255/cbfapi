const bcrypt = require("bcrypt");
const { Register } = require("../models"); // Adjust path as needed
const sendMail = require("../helpers/sendMail");
const mailBody = require("../helpers/mailBody");
const { generateToken } = require("../helpers/authtoken");
const models = require("../models");
const { uploadFile } = require("../upload");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

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

async function uploadImage(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded." });
    }

    if (req.files.length > 5) {
      return res
        .status(400)
        .json({ error: "You can upload at most 5 images." });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ error: `Invalid file type: ${file.originalname}` });
      }

      if (file.size > MAX_FILE_SIZE) {
        return res
          .status(400)
          .json({ error: `File too large: ${file.originalname}` });
      }

      const imageUrl = await uploadFile(file, "gallery");

      // Save to Sequelize
      const imageRecord = await models.GalleryImage.create({
        imageUrl,
        uploadedBy: req.body.uploadedBy || null, // optional
      });

      uploadedUrls.push(imageRecord);
    }

    return res.status(200).json({
      message: "Images uploaded and saved to DB",
      files: uploadedUrls,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Server error uploading images." });
  }
}

async function getUploadImage(req, res) {
  try {
    const images = await models.GalleryImage.findAll({
      attributes: ["id", "imageUrl", "uploadedBy", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    // if (!images || images.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "No images found.", data: images });
    // }

    return res.status(200).json({
      status: "Success",
      message: "Images fetched successfully",
      data: images,
    });
  } catch (error) {
    console.error("Get Upload Image Error:", error);
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
  uploadImage,
  getUploadImage,
};
