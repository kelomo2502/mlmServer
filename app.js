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
    origin: [
      "http://localhost:5173",
      "https://mlm-server-pv4fagrht-kelomo2502s-projects.vercel.app",
    ],
    credentials: true,
  })
);
// app.get("/test", (req, res) => {
//   res.send("Welcome to mlm server");
// });
app.use("/api/v1", marketerRoutes);

app.use(errorHandler);
const start = async () => {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017", {
      dbName: "mlmDB",
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
    });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
};
start();
