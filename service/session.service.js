const model = require("../models");
async function createSession(req, res) {
  const { date, starttime, endtime, name, speakers } = req.body;

  try {
    const sessionExist = await model.Sessions.findOne({
      where: {
        date,
        starttime,
        endtime,
        name,
      },
    });

    if (sessionExist) {
      return res.status(409).json({
        status: "Failed",
        message: "Session already exists",
      });
    }

    const newSession = await model.Sessions.create({
      date: new Date(date),
      starttime,
      endtime,
      name,
    });

    if (Array.isArray(speakers) && speakers.length) {
      await newSession.setSpeakers(speakers);
    }

    return res.status(201).json({
      status: "Success",
      message: "Session created successfully",
      data: newSession,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: error?.message || "Something went wrong",
    });
  }
}

async function getAllSession(req, res) {
  try {
    const sessions = await model.Sessions.findAll({
      include: [
        {
          model: model.Speakers,
          through: { attributes: [] }, // Exclude join table data
        },
      ],
    });

    const formattedSessions = sessions.map((session) => {
      const { date, starttime, endtime } = session;

      // Format date
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Helper to format time strings like "7:30" into "7:30 AM"
      const formatTime = (timeStr) => {
        const [hour, minute] = timeStr.split(":").map(Number);
        const tempDate = new Date();
        tempDate.setHours(hour);
        tempDate.setMinutes(minute || 0);
        return tempDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      };

      return {
        ...session.toJSON(),
        date: formattedDate,
        starttime: formatTime(starttime),
        endtime: formatTime(endtime),
      };
    });

    return res.status(200).json({
      status: "Success",
      message: "Sessions retrieved successfully",
      data: formattedSessions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: error?.message || "Something went wrong",
    });
  }
}

async function updateSession(req, res) {
  const { sessionId } = req.params;
  const { date, starttime, endtime, name, speakers } = req.body;

  try {
    const session = await model.Sessions.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({
        status: "Failed",
        message: "Session not found",
      });
    }

    // Check for duplicate session (excluding current one)
    const duplicate = await model.Sessions.findOne({
      where: {
        id: { [model.Sequelize.Op.ne]: sessionId },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        status: "Failed",
        message: "Another session with the same details already exists",
      });
    }

    // Update session fields
    session.date = new Date(date);
    session.starttime = starttime;
    session.endtime = endtime;
    session.name = name;

    await session.save();

    if (Array.isArray(speakers)) {
      // Validate speakers exist
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

      await session.setSpeakers(speakers); // All IDs are valid now
    }

    return res.status(200).json({
      status: "Success",
      message: "Session updated successfully",
      data: session,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: error?.message || "Something went wrong",
    });
  }
}

module.exports = { createSession, getAllSession, updateSession };
