const jwt = require("jsonwebtoken");
const User = require("../../models/user");

const asyncHandler = require("../../utils/asyncHandler/asyncHandler");
const AppError = require("../../utils/errorHandler/AppError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const SendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const Register = asyncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  return SendToken(newUser, 201, res);
});

const LogIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  return SendToken(user, 200, res);
});

const LogOut = (req, res) => {
  req.headers["authorization"].split(" ")[1] = null;
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully!" });
};

const verify = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(
      new AppError("You are not logged in! please log in to get access...", 401)
    );

  // const token = req.body.token || req.query.token || req.headers[ "x-access-token" ];

  // const [err, decoded] = jwt.verify(token, process.env.JWT_SECRET);
  // if (err) {
  //   return new AppError("Failed to authenticate token", 401);
  // }
  // console.log(decoded);
  // req.user = decoded;

  next();
};

module.exports = {
  Register,
  LogIn,
  LogOut,
  verify,
};
