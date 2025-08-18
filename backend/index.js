const express = require("express");
const fileupload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

require("dotenv").config({
  path: ".env",
});

const errorHandler = require("./utils/errorHandler/error");

const connectDB = require("./config/database");
const cors = require("cors");

const app = express();
connectDB();

app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(fileupload());

app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/products", require("./routes/products"));
app.use("/api/v1/feedbacks", require("./routes/feedbacks"));
app.use("/api/v1/posts", require("./routes/posts"));
app.use("/api/v1/comments", require("./routes/comments"));

app.all("*", (req, res, next) => {
  res.status(404).json({
    message: "url not found...",
  });
  next();
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
