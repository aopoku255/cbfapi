const model = require("../models");
const { Op } = require("sequelize");
async function createParallelSession(req, res) {
  const {
    sessionId,
    starttime,
    endtime,
    name,
    topic,
    sessionchair,
    speakers,
    hall,
    zoomlink,
  } = req.body;

  try {
    // Check if the parent session exists
    const session = await model.Sessions.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        status: "Failed",
        message: "Parent session not found",
      });
    }

    // Create the parallel session
    const parallelSession = await model.ParallelSession.create({
      sessionId,
      starttime,
      endtime,
      name,
      topic,
      sessionchair,
      hall,
      zoomlink,
    });

    // Associate speakers if provided
    if (Array.isArray(speakers) && speakers.length > 0) {
      await parallelSession.setSpeakers(speakers); // Many-to-Many relation
    }

    return res.status(201).json({
      status: "Success",
      message: "Parallel session created successfully",
      data: parallelSession,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: error.message || "Server error",
    });
  }
}

async function getAllParallelSession(req, res) {
  try {
    const parallelSessions = await model.ParallelSession.findAll({
      attributes: {
        exclude: ["sessionchair"],
      },
      include: [
        {
          model: model.Sessions,
          as: "session",
          attributes: ["id", "date", "name", "starttime", "endtime"],
        },
        {
          model: model.Speakers,
          attributes: ["id", "fname", "lname", "company", "email", "image"],
          through: { attributes: [] },
        },
      ],
    });

    return res.status(200).json({
      status: "Success",
      message: "Parallel sessions retrieved successfully",
      data: parallelSessions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
}

async function updateParallelSession(req, res) {
  const { parallelSessionId } = req.params;
  const {
    sessionId,
    starttime,
    endtime,
    name,
    topic,
    sessionchair,
    speakers,
    hall,
    zoomlink,
  } = req.body;

  try {
    // Check if the parallel session exists
    const parallelSession = await model.ParallelSession.findByPk(
      parallelSessionId
    );
    if (!parallelSession) {
      return res.status(404).json({
        status: "Failed",
        message: "Parallel session not found",
      });
    }

    // Optionally check if the new parent session exists (if sessionId is being updated)
    if (sessionId && sessionId !== parallelSession.sessionId) {
      const parentSession = await model.Sessions.findByPk(sessionId);
      if (!parentSession) {
        return res.status(404).json({
          status: "Failed",
          message: "Specified parent session not found",
        });
      }
      parallelSession.sessionId = sessionId;
    }

    // Update fields
    parallelSession.starttime = starttime;
    parallelSession.endtime = endtime;
    parallelSession.name = name;
    parallelSession.topic = topic;
    parallelSession.sessionchair = sessionchair;
    parallelSession.hall = hall;
    parallelSession.zoomlink = zoomlink;

    await parallelSession.save();

    // Validate speakers if provided
    if (Array.isArray(speakers)) {
      const validSpeakers = await model.Speakers.findAll({
        where: {
          id: speakers,
        },
      });

      if (validSpeakers.length !== speakers.length) {
        return res.status(400).json({
          status: "Failed",
          message: "One or more speaker IDs are invalid",
        });
      }

      await parallelSession.setSpeakers(speakers); // replaces old speakers
    }

    return res.status(200).json({
      status: "Success",
      message: "Parallel session updated successfully",
      data: parallelSession,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: error.message || "Server error",
    });
  }
}

async function ongoingSessions(req, res) {
  try {
    const now = new Date();

    // Get current time as "HH:mm"
    const currentTimeStr = now.toTimeString().slice(0, 5);

    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await model.ParallelSession.findAll({
      include: [
        {
          model: model.Sessions,
          as: "session",
          attributes: ["id", "name", "date"],
          where: {
            date: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
        },
        {
          model: model.Speakers,
          through: { attributes: [] },
        },
      ],
      where: {
        starttime: { [Op.lte]: currentTimeStr },
        endtime: { [Op.gte]: currentTimeStr },
      },
    });

    return res.status(200).json({
      status: "Success",
      message: "Currently ongoing parallel sessions",
      data: sessions,
    });
  } catch (error) {
    console.error("Ongoing parallel session error:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message || "Server Error",
    });
  }
}

async function upcomingSessions(req, res) {
  try {
    const now = new Date();
    const currentDateStr = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const currentTimeStr = now.toTimeString().slice(0, 8); // "HH:mm:ss"

    const sessions = await model.ParallelSession.findAll({
      include: [
        {
          model: model.Sessions,
          as: "session",
          attributes: ["id", "name", "date"],
          where: {
            date: {
              [Op.eq]: currentDateStr,
            },
          },
        },
        {
          model: model.Speakers,
          through: { attributes: [] },
        },
      ],
      where: {
        starttime: {
          [Op.gt]: currentTimeStr, // session starts after now
        },
      },
      order: [["starttime", "ASC"]],
      limit: 3,
    });

    return res.status(200).json({
      status: "Success",
      message: "Upcoming parallel sessions (after now)",
      data: sessions,
    });
  } catch (error) {
    console.error("Upcoming parallel session error:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message || "Server Error",
    });
  }
}

module.exports = {
  createParallelSession,
  getAllParallelSession,
  updateParallelSession,
  ongoingSessions,
  upcomingSessions,
};
