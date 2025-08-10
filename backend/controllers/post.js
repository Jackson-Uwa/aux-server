const Post = require("../models/post");
const AppError = require("../utils/errorHandler/AppError");
const asyncHandler = require("../utils/asyncHandler/asyncHandler");

const getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find().populate({
    path: "comments",
    select: "message",
  });
  return res.status(200).json({
    success: true,
    length: posts.length,
    payload: posts,
  });
});

const getPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId).populate({
    path: "comments",
    select: "message",
  });

  if (!post) return next(new AppError(`sorry no posts with id ${postId}`, 404));

  return res.status(200).json({
    success: true,
    payload: post,
  });
});

const createPost = asyncHandler(async (req, res, next) => {
  //try if no req.body
  const newPost = await Post.create(req.body);
  return res.status(201).json({
    success: true,
    newPost,
  });
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const updatedPost = await Post.findByIdAndUpdate(postId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPost) {
    return next(new AppError("failed to update record; not found.", 404));
  }

  return res.status(201).json({
    success: true,
    updatedPost,
  });
});

const deletePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError(`failed to delete record; not found.`, 404));
  }
  post.remove();
  res.status(204).json({
    success: true,
    payload: {},
  });
});

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
