const User = require("../../models/user");
const path = require("path");
const crypto = require("crypto");
const asyncHandler = require("../../utils/asyncHandler/asyncHandler");
const AppError = require("../../utils/errorHandler/AppError");
const jwt = require("jsonwebtoken");
const { Email } = require("../../utils/email/email");

const SendToken = (user, statusCode, res) => {
  const token = user.signToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 5 * 60 * 1000
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
    return next(new AppError("Invalid user credentials", 401));
  }

  SendToken(user, 200, res);
});

const LogOut = (req, res, next) => {
  res.clearCookie("jwt", {
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token)
    return next(
      new AppError("You are not logged in! please log in to get access...", 401)
    );

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    req.user = currentUser;
  } catch {
    next(new AppError("Invalid token", 500));
  }
  next();
});

const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      req.user = currentUser;
      res.locals.user = currentUser;
    } catch {
      next();
    }
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("User permission denied, contact IT help desk...", 403)
      );
    }
    next();
  };
};

const updateMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

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

      await User.findByIdAndUpdate(req.user.id, {
        photo: userPhoto.name,
      });

      res.status(200).json({
        success: true,
        data: userPhoto.name,
      });
    }
  );
});

const getUserProfileData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError(`Ooops no user with ID: ${req.user.id}`, 404));
  }
  return res.status(200).json({
    status: "success",
    user,
  });
});

const updateUserDetails = asyncHandler(async (req, res, next) => {
  const userDetails = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, userDetails, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("Invalid user record to be updated...", 403));
  }

  return res.status(200).json({
    status: true,
    data: user,
  });
});

const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new AppError("Incorrect user password", 403));
  }

  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;

  await user.save();
  SendToken(user, 200, res);
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError(`Sorry, no user with this email address`, 400));
  }

  const resetToken = await user.createResetToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/auth/reset-password/${resetToken}`;

  const message = `Kindly reset your password with this link >> ${resetUrl}`;

  try {
    await Email({
      email: user.email,
      subject: "Reset password",
      message,
    });

    return res.status(200).json({
      success: true,
      resetLink: `https://auxiliary.com/auth/reset-password/${resetToken}`,
      data: "Email sent successfully...",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending reset password email", 500)
    );
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Reset token has expired.", 403));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  const message = `User password has been changed at ${user.passwordChangedAt}`;

  try {
    await Email({
      email: user.email,
      subject: "Password reset successful",
      message,
    });

    SendToken(user, 200, res);
  } catch (error) {
    return next(
      new AppError("There was an error processing reset password email", 500)
    );
  }
});

const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  return res.status(204).json({ success: true });
});

module.exports = {
  Register,
  LogIn,
  LogOut,
  authenticate,
  isLoggedIn,
  authorize,
  updateMe,
  getUserProfileData,
  updateUserDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteMe,
};
