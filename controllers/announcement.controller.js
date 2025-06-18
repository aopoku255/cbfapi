const {
  createAnnouncement,
  getAnnouncement,
} = require("../service/announcement.service");

const router = require("express").Router();
router.post("/create", async (req, res) => {
  await createAnnouncement(req, res);
});

router.get("/get", async (req, res) => {
  await getAnnouncement(req, res);
});

module.exports = router;
