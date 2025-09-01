const express = require("express");
const errorHandler = require("./utils/errorHandler/error");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const hpp = require("hpp");
const cors = require("cors");
const connectDB = require("./config/database");
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
// const xss = require("xss-clean");

require("dotenv").config({
  path: ".env",
});

//Initiates connection with the database
connectDB();

//Initializes Express Application
const app = express();

app.use(cookieParser());
app.use(morgan("dev"));

//API SECURITY FEATURES

app.use(mongoSanitize());
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
  })
);

//Setting secure HTTP Headers
app.use(helmet());
app.use(hpp());

//Allow cross-origin-resource-sharing
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

//Parses and allows our service/database to receive / limit data/datasize (JavaScript Object Notation)
app.use(express.json({ limit: "10kb" }));

//Parses Form data
app.use(express.urlencoded({ extended: true }));

app.use(fileupload());

//Setting public folder to serve static files
app.use(express.static(path.join(__dirname, "..", "public")));

//Routes
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/products", require("./routes/products"));
app.use("/api/v1/feedbacks", require("./routes/feedbacks"));
app.use("/api/v1/posts", require("./routes/posts"));
app.use("/api/v1/comments", require("./routes/comments"));

//Redirects for unspecified routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    message: "url not found...",
  });
  next();
});

const PORT = process.env.PORT || 5000;

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
