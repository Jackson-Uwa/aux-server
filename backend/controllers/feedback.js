const Feedback = require("../models/feedback");
const Product = require("../models/product");
const APIFeatures = require("../utils/APIFeatures/APIFeatures");
const AppError = require("../utils/errorHandler/AppError");
const asyncHandler = require("../utils/asyncHandler/asyncHandler");
const feedback = require("../models/feedback");

const getFeedbacks = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Feedback.find()
      .populate({ path: "product", select: "name price" })
      .populate({ path: "user", select: "firstName email" }),
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
  const feedback = await Feedback.findById(req.params.fid)
    .populate({
      path: "product",
      select: "name price",
    })
    .populate({ path: "user", select: "firstName email" });

  if (!feedback) {
    return next(new AppError(`Ooops no feed with ID: ${req.params.fid}`, 404));
  }

  return res.json({ status: "success", feedback }).status(200);
});

const addFeedback = asyncHandler(async (req, res, next) => {
  req.body.product = req.params.pid;
  req.body.user = req.user.id;

  const product = await Product.findById(req.params.pid);

  if (!product) {
    return next(new AppError("invalid product id, unable to create feedback"));
  }

  const newFeedback = await Feedback.create(req.body);

  return res.status(201).json({
    status: "success",
    newFeedback,
  });
});

const updateFeedback = asyncHandler(async (req, res, next) => {
  let feedback = await Feedback.findByIdAndUpdate(req.params.fid);

  if (!feedback) {
    return next(new AppError(`Ooops no feed with ID: ${req.params.fid}`, 404));
  }

  if (feedback.user.toString() !== req.user.id) {
    return next(new AppError("Permission denied", 403));
  }

  feedback = await Feedback.findByIdAndUpdate(req.params.fid, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    status: "success",
    feedback,
  });
});

const deleteFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.fid);

  if (!feedback) {
    return next(new AppError(`Ooops no feed with ID: ${req.params.fid}`, 404));
  }

  if (feedback.user.toString() !== req.user.id) {
    return next(new AppError("Permission denied", 403));
  }

  await Feedback.findByIdAndDelete(req.params.fid);

  return res.status(204).json({ success: true });
});

module.exports = {
  getFeedbacks,
  getFeedbackID,
  addFeedback,
  updateFeedback,
  deleteFeedback,
};
