const Comment = require("../models/comment");
const AppError = require("../utils/errorHandler/AppError");
const asyncHandler = require("../utils/asyncHandler/asyncHandler");

const getComments = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find().populate({
    path: "post",
    select: "title description",
  });

  return res.status(200).json({
    success: true,
    length: comments.length,
    payload: comments,
  });
});

const getComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId).populate({
    path: "post",
    select: "title description",
  });

  if (!comment)
    return next(new AppError(`sorry no posts with id ${commentId}`, 404));

  return res.status(200).json({
    success: true,
    payload: comment,
  });
});

const createComment = asyncHandler(async (req, res, next) => {
  //try if no req.body

  const { postId } = req.params;

  req.body.post = postId;

  const newComment = await Comment.create(req.body);
  return res.status(201).json({
    success: true,
    newComment,
  });
});

const updateComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const updatedComment = await Comment.findByIdAndUpdate(commentId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedComment) {
    return next(new AppError("failed to update record; not found.", 404));
  }

  return res.status(201).json({
    success: true,
    updatedComment,
  });
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) {
    return next(new AppError(`failed to delete record; not found.`, 404));
  }
  //   comment.remove();
  res.status(204).json({
    success: true,
    payload: {},
  });
});

module.exports = {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
};
