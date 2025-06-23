const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

async function uploadFile(file, base_dir_name) {
  const uploadDir = path.join(__dirname, "uploads", base_dir_name);

  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${uuidv4().slice(0, 6)}-${file.originalname.replace(
    /\s+/g,
    "_"
  )}`;
  const filePath = path.join(uploadDir, fileName);

  const watermarkPath = path.join(__dirname, "uploads", "watermark.png"); // Adjust path to your watermark

  try {
    // Process and overlay watermark
    const imageWithWatermark = await sharp(file.buffer)
      .composite([
        {
          input: watermarkPath,
          gravity: "southwest", // Bottom-left
          blend: "overlay",
        },
      ])
      .toFile(filePath);

    const imageUrl = `/uploads/${base_dir_name}/${fileName}`;
    return imageUrl;
  } catch (err) {
    console.error("Error adding watermark:", err);
    throw err;
  }
}

module.exports = {
  uploadFile,
};
