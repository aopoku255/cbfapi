const { where } = require("sequelize");
const model = require("../models");
const { uploadFile } = require("../upload");
async function createSpeaker(req, res) {
  //   const { fname, lname, prefix } = req.body;
  try {
    const speakerExist = await model.Speakers.findOne({
      where: { email: req.body.email },
    });
    if (speakerExist) {
      return res.status(409).json({
        message: "Speaker already exist",
        status: "Failed",
      });
    }
    console.log(req.file);
    const speakerImage = await uploadFile(req.file, "speakers");
    const speaker = await model.Speakers.create({
      ...req.body,
      image: speakerImage,
    });
    if (speaker) {
      return res.status(201).json({ message: "success" });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error?.message,
    });
  }
}

async function getAllSpeakers(req, res) {
  try {
    const speakers = await model.Speakers.findAll({
      include: [
        {
          model: model.ParallelSession,
          through: { attributes: [] }, // hides the join table fields
        },
      ],
    });

    return res.status(200).json({
      status: "Success",
      message: "Speakers retrieved successfully",
      data: speakers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
}

async function updateSpeaker(req, res) {
  try {
    const { speakerId } = req.params;
    const updates = req.body;

    // Find speaker by primary key
    const speaker = await model.Speakers.findByPk(speakerId);

    if (!speaker) {
      return res.status(404).json({
        message: "No speaker found with this ID",
        status: "Failed",
      });
    }

    // Update the speaker with the provided data
    await speaker.update(updates);

    return res.status(200).json({
      message: "Speaker updated successfully",
      status: "Success",
      data: speaker,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while updating the speaker",
      status: "Error",
    });
  }
}

module.exports = { createSpeaker, getAllSpeakers, updateSpeaker };
