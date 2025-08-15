const User = require("../../models/user");
const path = require("path");
const asyncHandler = require("../../utils/asyncHandler/asyncHandler");
const AppError = require("../../utils/errorHandler/AppError");
const jwt = require("jsonwebtoken");

const SendToken = (user, statusCode, res) => {
  const token = user.signToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") options.secure = true;

  res.status(statusCode).cookie("jwt", token, options).json({
    success: true,
    token,
    user,
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

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  return SendToken(user, 200, res);
});

const LogOut = (req, res, next) => {
  res.clearCookie("jwt", {
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

const verify = (req, res, next) => {
  let token;

  if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token)
    return next(
      new AppError("You are not logged in! please log in to get access...", 401)
    );
  /*
  const [err, decoded] = jwt.verify(token, process.env.JWT_SECRET);
  if (err) {
    return next(new AppError("Failed to authenticate user", 401));
  }
  console.log(decoded);
  req.user = decoded;
*/
  next();
};

const uploadProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.uid);

  if (!user) {
    return next(
      new AppError("No user profile/record for upload, Kindly login...", 401)
    );
  }

  if (!req.files) {
    return next(new AppError("Please upload a file", 400));
  }

  const userPhoto = req.files.photo;

  if (!userPhoto.mimetype.startsWith("image"))
    return next(new AppError("Please upload an image file", 400));

  if (userPhoto.size > process.env.MAX_FILE_UPLOAD)
    return next(new AppError("Sorry, can't upload file more than 1MB", 400));

  userPhoto.name = `user_photo_${user._id}${path.parse(userPhoto.name).ext}`;

  userPhoto.mv(
    `${process.env.USER_FILE_PATH}/${userPhoto.name}`,
    async (err) => {
      if (err) {
        return next(new AppError("problem uploading file...", 500));
      }

      await User.findByIdAndUpdate(req.params.uid, {
        photo: userPhoto.name,
      });

      res.status(200).json({
        success: true,
        data: userPhoto.name,
      });
    }
  );
});

module.exports = {
  Register,
  LogIn,
  LogOut,
  verify,
  uploadProfile,
};
