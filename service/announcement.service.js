const announcementMailBody = require("../helpers/announcementMailBody");
const sendMail = require("../helpers/sendMail");
const models = require("../models");

async function createAnnouncement(req, res) {
  try {
    const { name, content } = req.body;

    if (!name || !content) {
      return res.status(400).json({
        status: "Failed",
        message: "Name and content are required",
      });
    }

    const announcement = await models.Announcement.create({ name, content });

    const users = await models.Register.findAll({
      attributes: ["email", "last_name", "prefix"],
      where: {
        email: {
          [models.Sequelize.Op.ne]: null,
        },
        last_name: {
          [models.Sequelize.Op.ne]: null,
        },
        prefix: {
          [models.Sequelize.Op.ne]: null,
        },
      },
      raw: true,
    });

    const emailPromises = users.map(
      async ({ email, last_name, prefix }) =>
        await sendMail(
          email,
          announcementMailBody(`${prefix} ${last_name}`, name, content),
          "ANNOUNCEMENT"
        )
    );

    await Promise.all(emailPromises);

    return res.status(201).json({
      status: "Success",
      message: "Announcement created and emails sent",
      data: announcement,
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function getAnnouncement(req, res) {
  try {
    const announcements = await models.Announcement.findAll({
      order: [["createdAt", "DESC"]], // Sort by latest first
    });

    return res.status(200).json({
      status: "Success",
      message: "Announcements retrieved successfully",
      data: announcements,
    });
  } catch (error) {
    console.error("Get Announcement Error:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = { createAnnouncement, getAnnouncement };
