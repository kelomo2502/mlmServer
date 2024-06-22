// app.js
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const marketerRoutes = require("./routes/marketerRoutes");
const errorHandler = require("./middlewares/errorhandler");

const app = express();
const PORT = process.env.PORT || 3100;
// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173/"],
    credentials: true,
  })
);
app.use("/api/v1", marketerRoutes);
app.get("/test", (req, res) => {
  res.send(`<h1>Hello Server</h1>`);
});

console.log(process.env.MONGODB_URI);
app.use(errorHandler);
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "MarketerDB",
    });
    console.log("Connected to database");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
};
start();
