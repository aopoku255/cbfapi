const {
  registerUser,
  loginUser,
  getUserInfo,
} = require("../service/register.service");

const router = require("express").Router();

router.post("/register", async (req, res) => {
  await registerUser(req, res);
});

router.post("/login", async (req, res) => {
  await loginUser(req, res);
});

router.get("/:userId", async (req, res) => {
  await getUserInfo(req, res);
});

router.get("/get-allusers", async (req, res) => {
  await getAllUsers(req, res);
});

module.exports = router;
