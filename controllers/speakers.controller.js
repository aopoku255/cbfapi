const {
  createSpeaker,
  getAllSpeakers,
  updateSpeaker,
} = require("../service/speakers.service");
const multer = require("multer");
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage: storage });

const router = require("express").Router();

router.get("/speakers", async (req, res) => {
  await getAllSpeakers(req, res);
});

router.post(
  "/create-speaker",
  uploadMiddleware.single("image"),
  async (req, res) => {
    await createSpeaker(req, res);
  }
);

router.patch("/update-speaker/:speakerId", async (req, res) => {
  await updateSpeaker(req, res);
});

module.exports = router;
