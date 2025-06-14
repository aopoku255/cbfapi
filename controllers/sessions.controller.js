const {
  createSession,
  getAllSession,
  updateSession,
} = require("../service/session.service");

const router = require("express").Router();

router.post("/create-session", async (req, res) => {
  await createSession(req, res);
});

router.get("/session", async (req, res) => {
  await getAllSession(req, res);
});
router.patch("/update-session/:sessionId", async (req, res) => {
  await updateSession(req, res);
});

module.exports = router;
