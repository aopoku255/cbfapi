const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

/**
 * Upload a buffer to the filesystem with optional watermark overlay
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} base_dir_name - The base directory name (e.g., 'gallery', 'speakers')
 * @param {string} originalFilename - Original filename for naming (optional)
 * @param {boolean} applyWatermark - Whether to apply watermark overlay (default: true)
 * @returns {string} The URL path to the uploaded image
 */
async function uploadFile(imageBuffer, base_dir_name, originalFilename = "image.jpg", applyWatermark = true) {
  const uploadDir = path.join(__dirname, "uploads", base_dir_name);

  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${uuidv4().slice(0, 6)}-${originalFilename.replace(
    /\s+/g,
    "_"
  )}`;
  const filePath = path.join(uploadDir, fileName);

  const watermarkPath = path.join(__dirname, "uploads", "watermark.png");

  try {
    let pipeline = sharp(imageBuffer);

    // Apply watermark if requested
    if (applyWatermark && fs.existsSync(watermarkPath)) {
      pipeline = pipeline.composite([
        {
          input: watermarkPath,
          gravity: "southwest", // Bottom-left
          blend: "overlay",
        },
      ]);
    }

    await pipeline.toFile(filePath);

    const imageUrl = `/uploads/${base_dir_name}/${fileName}`;
    return imageUrl;
  } catch (err) {
    console.error("Error processing and uploading image:", err);
    throw err;
  }
}

module.exports = {
  uploadFile,
};
