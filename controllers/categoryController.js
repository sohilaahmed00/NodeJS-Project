import Category from "../models/categoryModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: "success",
    data: categories,
  });
});

const CreateCategory = asyncHandler(async (req, res, next) => {
  const image = req.file ? req.file.filename : null;
  const { name } = req.body;
  const category = await Category.create({
    name,
    image,
  });
  res.status(201).json({
    status: "success",
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOneAndDelete({ name: req.params.name });
  res.status(200).json({
    status: "success",
    message: "Category deleted successfully",
  });
});

const updateCategory = asyncHandler(async (req, res, next) => {
  const image = req.file ? req.file.filename : null;
  const updatedCategory = await Category.findOneAndUpdate(
    { name: req.params.name },
    req.body,
    { new: true },
  );
  res.status(200).json({ status: "success", data: updatedCategory });
});

const getCategoryByName = asyncHandler(async (req, res, next) => {
  const categoryName = req.params.name;
  const category = await Category.findOne({ name: categoryName });
  if (!category) {
    return res
      .status(404)
      .json({ status: "fail", message: "Category not found" });
  }
  res.status(200).json({ status: "success", data: category });
});

export {
  getAllCategories,
  CreateCategory,
  deleteCategory,
  updateCategory,
  getCategoryByName,
};
