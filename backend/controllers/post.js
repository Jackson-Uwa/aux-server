const Post = require("../models/post");
const APIFeatures = require("../utils/APIFeatures/APIFeatures");
const AppError = require("../utils/errorHandler/AppError");
const asyncHandler = require("../utils/asyncHandler/asyncHandler");

const getPosts = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Post.find()
      .populate({ path: "comments", select: "comment" })
      .populate({ path: "user", select: "firstName email" }),
    req.query
  )
    .filter()
    .sort()
    .select()
    .paginate();

  const posts = await features.query;

  const pagination = {};

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Post.countDocuments();

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
    length: posts.length,
    pagination,
    payload: posts,
  });
});

const getPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId)
    .populate({
      path: "comments",
      select: "comment",
    })
    .populate({ path: "user", select: "firstName email" });

  if (!post) return next(new AppError(`sorry no posts with id ${postId}`, 404));

  return res.status(200).json({
    success: true,
    payload: post,
  });
});

const createPost = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const newPost = await Post.create(req.body);
  return res.status(201).json({
    success: true,
    newPost,
  });
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  let post = await Post.findByIdAndUpdate(postId);

  if (!post) {
    return next(new AppError("failed to update record; not found.", 404));
  }

  if (post.user.toString() !== req.user.id)
    return next(
      new AppError("permission denied, cant't update post you did not create")
    );

  post = await Post.findByIdAndUpdate(postId, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    post,
  });
});

const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post)
    return next(new AppError(`failed to delete record; not found.`, 404));

  if (post.user.toString() !== req.user.id)
    return next(new AppError("Permission denied", 403));

  await Post.findByIdAndDelete(req.params.postId);

  return res.status(204).json({ success: true });
});

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
