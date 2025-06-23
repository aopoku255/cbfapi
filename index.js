const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/v1", require("./routes/router"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
