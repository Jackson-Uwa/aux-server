const Feedback = require("../models/feedback");
const APIFeatures = require("../utils/APIFeatures/APIFeatures");
const AppError = require("../utils/errorHandler/AppError");
const asyncHandler = require("../utils/asyncHandler/asyncHandler");

const Product = require("../models/product");

const getFeedbacks = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Feedback.find().populate({ path: "product", select: "name price" }),
    req.query
  )
    .filter()
    .sort()
    .select()
    .paginate();

  const feedbacks = await features.query;

  const pagination = {};

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Feedback.countDocuments();

  if (startIndex >= 1) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  } else if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  return res.status(200).json({
    status: "success",
    length: feedbacks.length,
    pagination,
    payload: feedbacks,
  });
});

const getFeedbackID = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.fid).populate({
    path: "product",
    select: "name price",
  });

  if (!feedback) {
    return next(new AppError(`Ooops no feed with ID: ${req.params.fid}`, 404));
  }

  return res.json({ status: "success", feedback }).status(200);
});

const addFeedback = asyncHandler(async (req, res, next) => {
  const { pid } = req.params;
  req.body.product = pid;

  const product = await Product.findById(pid);

  if (product._id.toString() !== pid) {
    return next(new AppError("invalid product id, unable to create feedback"));
  }

  const newFeedback = await Feedback.create(req.body);
  return res.status(201).json({
    status: "success",
    newFeedback,
  });
});

const updateFeedback = asyncHandler(async (req, res, next) => {
  const updatedFeedback = await Feedback.findByIdAndUpdate(
    req.params.fid,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedFeedback) {
    return next(new AppError(`Ooops no feed with ID: ${req.params.fid}`, 404));
  }
  return res.status(201).json({
    status: "success",
    updatedFeedback,
  });
});

const deleteFeedback = asyncHandler(async (req, res, next) => {
  const deletedFeed = await Feedback.findByIdAndDelete(req.params.fid);
  if (!deletedFeed) {
    return next(new AppError(`Ooops no feed with ID: ${req.params.fid}`, 404));
  }
  return res
    .json({
      status: "success",
      data: {},
    })
    .status(204);
});

module.exports = {
  getFeedbacks,
  getFeedbackID,
  addFeedback,
  updateFeedback,
  deleteFeedback,
};
