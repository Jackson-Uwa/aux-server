const Comment = require("../models/comment");
const Post = require("../models/post");
const APIFeatures = require("../utils/APIFeatures/APIFeatures");
const AppError = require("../utils/errorHandler/AppError");
const asyncHandler = require("../utils/asyncHandler/asyncHandler");
const { path } = require("express/lib/application");

const getComments = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Comment.find()
      .populate({ path: "post", select: "title description" })
      .populate({ path: "user", select: "firstName email" }),
    req.query
  )
    .filter()
    .sort()
    .select()
    .paginate();

  const comments = await features.query;

  const pagination = {};

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Comment.countDocuments();

  if (startIndex >= 1) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  } else if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  return res.status(200).json({
    success: true,
    length: comments.length,
    pagination,
    payload: comments,
  });
});

const getComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId)
    .populate({
      path: "post",
      select: "title description",
    })
    .populate({ path: "user", select: "firstName email" });

  if (!comment)
    return next(new AppError(`sorry no posts with id ${commentId}`, 404));

  return res.status(200).json({
    success: true,
    payload: comment,
  });
});

const createComment = asyncHandler(async (req, res, next) => {
  //try if no req.body
  req.body.post = req.params.postId;
  req.body.user = req.user.id;

  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new AppError("Invalid post to comment on"));
  }

  const newComment = await Comment.create(req.body);

  return res.status(201).json({
    success: true,
    newComment,
  });
});

const updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new AppError("failed to update record; not found.", 404));
  }

  if (comment.user.toString() !== req.user.id) {
    return next(new AppError("Permission denied", 403));
  }

  await Comment.findByIdAndUpdate(req.params.commentId, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    comment,
  });
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new AppError(`failed to delete record; not found.`, 404));
  }

  if (comment.user.toString() !== req.user.id) {
    return next(new AppError("Permission denied", 403));
  }

  await Comment.findByIdAndDelete(req.params.commentId);

  return res.status(204);
});

module.exports = {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
};
