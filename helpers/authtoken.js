const jwt = require("jsonwebtoken");
require("dotenv");
const generateToken = (user) => {
  const accessToken = jwt.sign(user, "CARISCA2025", {
    expiresIn: 60 * 60 * 4,
  });
  return accessToken;
};

module.exports = { generateToken };
