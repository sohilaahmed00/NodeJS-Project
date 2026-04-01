import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find().populate("category", "name image -_id");
  res.status(200).json({
    status: "success",
    data: products,
  });
});

const createProduct = asyncHandler(async (req, res, next) => {
  const image = req.file ? req.file.filename : null;
  const { name, price, description, quantity, priceAfterDiscount, category } =
    req.body;

  const product = await Product.create({
    name,
    price,
    description,
    image,
    quantity,
    priceAfterDiscount,
    category,
  });
  res.status(201).json({
    status: "success",
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  res
    .status(200)
    .send({ status: "success", message: "Product deleted successfully" });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const image = req.file ? req.file.filename : null;
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    },
  );
  res.status(200).json({ status: "success", data: updatedProduct });
});

const getProductByPrice = asyncHandler(async (req, res, next) => {
  const price = req.params.price;
  const products = await Product.find({ price: { $lte: price } }).populate(
    "category",
    "name image -_id",
  );
  res.status(200).json({ status: "success", data: products });
});

const searchProductsByName = asyncHandler(async (req, res, next) => {
  const nameQuery = req.query.name;
  if (!nameQuery) {
    return next(new APIError("Please provide a search term", 400));
  }
  const products = await Product.find({
    name: { $regex: nameQuery, $options: "i" },
  }).populate("category", "name image -_id");
  res.status(200).json({ status: "success", data: products });
});

const filterByCategory = asyncHandler(async (req, res, next) => {
  const categoryQuery = req.query.category;
  if (!categoryQuery) {
    return next(new APIError("Please provide a search term", 400));
  }

  const category = await Category.findOne({
    name: { $regex: categoryQuery, $options: "i" },
  });

  if (!category) {
    return next(new APIError("Category not found", 404));
  }

  const products = await Product.find({ category: category._id }).populate(
    "category",
    "name image -_id",
  );

  res.status(200).json({ status: "success", data: products });
});

export {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductByPrice,
  searchProductsByName,
  filterByCategory,
};
