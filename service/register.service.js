const bcrypt = require("bcrypt");
const { Register } = require("../models"); // Adjust path as needed
const sendMail = require("../helpers/sendMail");
const mailBody = require("../helpers/mailBody");
const otpMailBody = require("../helpers/otpMailBody");
const { generateToken } = require("../helpers/authtoken");
const models = require("../models");
const { uploadFile } = require("../upload");
const sharp = require("sharp");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const otpStore = new Map();

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function sendLoginOtp(email, otp, name) {
  const subject = "Your login verification code";
  const displayName = name || email.split("@")[0] || "there";
  const message = otpMailBody(displayName, otp);

  await sendMail(email, message, subject);
}

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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "Failed",
        message: "Email is required to send the OTP.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await Register.findOne({ where: { email: normalizedEmail } });

    if (!existingUser) {
      return res.status(404).json({
        status: "Failed",
        message: "No registration found for this email.",
      });
    }

    const otp = generateOtp();
    otpStore.set(normalizedEmail, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendLoginOtp(normalizedEmail, otp, existingUser.first_name);

    return res.status(200).json({
      status: "Success",
      message: "A 4-digit OTP has been sent to your email.",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Server error while sending OTP.",
    });
  }
}

async function verifyLoginOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: "Failed",
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const storedOtp = otpStore.get(normalizedEmail);

    if (!storedOtp) {
      return res.status(400).json({
        status: "Failed",
        message: "OTP expired or not found. Please request a new one.",
      });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        status: "Failed",
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (String(storedOtp.otp) !== String(otp).trim()) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid OTP.",
      });
    }

    let user = null;

    try {
      user = await Register.findOne({ where: { email: normalizedEmail } });
    } catch (dbError) {
      console.warn("OTP verify DB lookup skipped:", dbError.message);
    }

    otpStore.delete(normalizedEmail);

    const token = await generateToken({
      id: user?.id || null,
      email: normalizedEmail,
    });

    return res.status(200).json({
      status: "Success",
      message: "Login successful",
      data: user || { email: normalizedEmail },
      token,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Server error while verifying OTP.",
    });
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

/**
 * Compress and resize the main image
 * Max 1200px wide, preserve aspect ratio, no upscaling, WebP at 80% quality
 */
async function compressMainImage(fileBuffer) {
  return sharp(fileBuffer)
    .resize(1200, null, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: 80 })
    .toBuffer();
}

/**
 * Generate a thumbnail image
 * 400x400 cover crop, WebP at 70% quality
 */
async function generateThumbnail(fileBuffer) {
  return sharp(fileBuffer)
    .resize(400, 400, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 70 })
    .toBuffer();
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

    // Validate all files BEFORE compression (fail fast)
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
    }

    const uploadedUrls = [];

    // Process each file: compress main image + generate thumbnail in parallel
    for (const file of req.files) {
      try {
        // Run main image compression and thumbnail generation in parallel
        const [mainImageBuffer, thumbnailBuffer] = await Promise.all([
          compressMainImage(file.buffer),
          generateThumbnail(file.buffer),
        ]);

        // Generate a base filename without extension (will be added by uploadFile if needed)
        const baseFilename = file.originalname.replace(/\.[^/.]+$/, "");

        // Upload compressed main image (with watermark)
        const mainImageUrl = await uploadFile(
          mainImageBuffer,
          "gallery",
          `${baseFilename}.webp`,
          true // apply watermark
        );

        // Upload thumbnail (without watermark, or with optional param control)
        const thumbnailUrl = await uploadFile(
          thumbnailBuffer,
          "gallery",
          `${baseFilename}-thumb.webp`,
          false // no watermark for thumbnail
        );

        // Save both URLs to Sequelize
        const imageRecord = await models.GalleryImage.create({
          imageUrl: mainImageUrl,
          thumbnailUrl: thumbnailUrl,
          uploadedBy: req.body.uploadedBy || null,
        });

        uploadedUrls.push(imageRecord);
      } catch (fileErr) {
        console.error(`Error processing file ${file.originalname}:`, fileErr);
        return res.status(500).json({
          error: `Error processing file: ${file.originalname}`,
        });
      }
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
  verifyLoginOtp,
  getUserInfo,
  getAllUsers,
  uploadImage,
  getUploadImage,
};
