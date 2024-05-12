// app.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const marketerRoutes = require("./routes/marketerRoutes");
const errorHandler = require("./middlewares/errorhandler");

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json());

app.use("/marketers", marketerRoutes);

app.use(errorHandler);
const start = async () => {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017", {
      dbName: "eloquent_realtorsDB",
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
    });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
