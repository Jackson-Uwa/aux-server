const User = require("../models/user");
const APIFeatures = require("../utils/APIFeatures/APIFeatures");
const AppError = require("../utils/errorHandler/AppError");
const asyncHandler = require("../utils/asyncHandler/asyncHandler");

const getUsers = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .select()
    .paginate();

  const users = await features.query;

  const pagination = {};

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments();

  if (endIndex < total) pagination.next = { page: page++, limit };

  if (startIndex >= 1)
    pagination.prev = {
      page: page--,
      limit,
    };

  res.status(200).json({
    status: "success",
    length: users.length,
    pagination,
    payload: users,
  });
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

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user.id);

  if (!user) {
    return next(new AppError(`Ooops no user with ID: ${req.user.id}`, 404));
  }
  return res.status(204).json({ status: "success" });
});

module.exports = {
  getUsers,
  getUserProfileData,
  deleteUser,
};
