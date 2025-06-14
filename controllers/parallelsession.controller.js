const {
  createParallelSession,
  getAllParallelSession,
  updateParallelSession,
  ongoingSessions,
  upcomingSessions,
} = require("../service/parallelsession.service");

const router = require("express").Router();

router.post("/create-parallel-session", async (req, res) => {
  await createParallelSession(req, res);
});

router.get("/parallel-session", async (req, res) => {
  await getAllParallelSession(req, res);
});

router.patch("/parallel-session/:parallelSessionId", async (req, res) => {
  await updateParallelSession(req, res);
});

router.get("/ongoing-sessions", async (req, res) => {
  await ongoingSessions(req, res);
});

router.get("/upcoming-sessions", async (req, res) => {
  await upcomingSessions(req, res);
});

module.exports = router;
