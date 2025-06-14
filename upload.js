const path = require("path");
const fs = require("fs");
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

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
        return reject(err);
      }
      const imageUrl = `/uploads/${base_dir_name}/${fileName}`;
      resolve(imageUrl);
    });
  });
}

async function removeFile(filePath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(__dirname, filePath);

    fs.unlink(fullPath, (err) => {
      if (err) {
        if (err.code === "ENOENT") {
          // File doesn't exist
          console.log("File not found:", fullPath);
          return resolve(false); // File already removed
        }
        return reject(err);
      }
      console.log("File successfully removed:", fullPath);
      resolve(true); // File successfully removed
    });
  });
}

module.exports = { uploadFile, removeFile };
