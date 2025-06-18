const {
  register,
  login,
  getRegistrations,
} = require("../service/admin.service");

const router = require("express").Router();

router.post("/register", async (req, res) => {
  await register(req, res);
});

router.post("/login", async (req, res) => {
  await login(req, res);
});

router.get("/get-registrations", async (req, res) => {
  await getRegistrations(req, res);
});

module.exports = router;
