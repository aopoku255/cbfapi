const router = require("express").Router();

router.use("/speakers", require("../controllers/speakers.controller"));
router.use("/sessions", require("../controllers/sessions.controller"));
router.use("/parallel", require("../controllers/parallelsession.controller"));
router.use("/admin", require("../controllers/admin.controller"));
router.use("/user", require("../controllers/register.controller"));
router.use("/announcements", require("../controllers/announcement.controller"));

module.exports = router;
