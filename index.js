const express = require("express");
const morgan = require("morgan");
const path = require("path");

const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/v1", require("./routes/router"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
