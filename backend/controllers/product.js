const Product = require("../models/product");
const APIFeatures = require("../utils/APIFeatures/APIFeatures");
const AppError = require("../utils/errorHandler/AppError");
const asyncHandler = require("../utils/asyncHandler/asyncHandler");

const getProducts = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Product.find().populate({ path: "feedbacks", select: "text rating" }),
    req.query
  )
    .filter()
    .sort()
    .select()
    .paginate();

  const products = await features.query;

  const pagination = {};

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments();

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
    length: products.length,
    pagination,
    payload: products,
  });
});

const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.pid).populate({
    path: "feedbacks",
    select: "text rating",
  });

  if (!product) {
    return next(
      new AppError(`Ooops no product with ID: ${req.params.pid}`, 404)
    );
  }

  return res.status(200).json({
    status: "success",
    payload: product,
  });
});

const addProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);
  return res.status(201).json({
    status: "success",
    product,
  });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.pid,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedProduct) {
    return next(
      new AppError(`Ooops no product with ID: ${req.params.pid}`, 404)
    );
  }

  return res.status(200).json({
    status: "success",
    updatedProduct,
  });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.pid);

  if (!product)
    return next(
      new AppError(`Ooops no product with ID: ${req.params.pid}`, 404)
    );

  delete product;

  return res.status(204).json({ status: "success", data: {} });
});

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
};
