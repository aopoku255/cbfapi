const bcrypt = require("bcrypt");
const model = require("../models"); // adjust path as needed
const jwt = require("jsonwebtoken");

async function register(req, res) {
  const { username, firstname, lastname, password } = req.body;

  try {
    // Check if admin already exists
    const adminExists = await model.Admin.findOne({
      where: { username },
    });

    if (adminExists) {
      return res.status(400).json({
        status: "Failed",
        message: "Admin with this username already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = await model.Admin.create({
      username,
      firstname,
      lastname,
      password: hashedPassword,
    });

    return res.status(201).json({
      status: "Success",
      message: "Admin account created successfully",
      data: {
        id: newAdmin.id,
        username: newAdmin.username,
        firstname: newAdmin.firstname,
        lastname: newAdmin.lastname,
      },
    });
  } catch (error) {
    console.error("Create Admin Error:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message || "Internal server error",
    });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  try {
    // Check if admin exists
    const admin = await model.Admin.findOne({ where: { username } });

    if (!admin) {
      return res.status(404).json({
        status: "Failed",
        message: "Invalid username or password.",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid username or password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || "yoursecretkey",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      status: "Success",
      message: "Login successful",
      token,
      data: {
        id: admin.id,
        username: admin.username,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message || "Internal server error",
    });
  }
}

async function getRegistrations(req, res) {
  try {
    const users = await model.Register.findAll({
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while fetching registrations",
    });
  }
}

module.exports = {
  register,
  login,
  getRegistrations,
};
