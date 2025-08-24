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

module.exports = {
  getUsers,
};
