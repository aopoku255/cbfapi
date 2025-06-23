const {
  registerUser,
  loginUser,
  getUserInfo,
  getAllUsers,
  uploadImage,
  getUploadImage,
} = require("../service/register.service");

const router = require("express").Router();
const multer = require("multer");

// Multer config with limits
const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // max 5 files
  },
});

router.post("/register", async (req, res) => {
  await registerUser(req, res);
});

router.post("/login", async (req, res) => {
  await loginUser(req, res);
});

router.get("/get-allusers", async (req, res) => {
  await getAllUsers(req, res);
});

router.post(
  "/upload-image", // ✅ fixed route path
  uploadMiddleware.array("images", 5),
  async (req, res, next) => {
    try {
      await uploadImage(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/get-all-images", async (req, res) => {
  await getUploadImage(req, res);
});

router.get("/:userId", async (req, res) => {
  await getUserInfo(req, res);
});

// Multer error handler (for file size, count, etc.)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
