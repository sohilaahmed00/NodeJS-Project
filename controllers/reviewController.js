import Review from "../models/reviewModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find()
    .populate("product_id", "name -_id")
    .populate("user_id", "name email -_id");
  res.status(200).json({ status: "success", data: reviews });
});

const createReview = asyncHandler(async (req, res, next) => {
  const product_id = req.params.productId;
  const user_id = req.user._id;
  const { rating, review } = req.body;
  const newReview = await Review.create({
    rating,
    review,
    product_id,
    user_id,
  });
  res.status(201).json({ status: "success", data: newReview });
});

const updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rating, review } = req.body || Review.find(id);
  const existingReview = await Review.findById(id);
  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { rating, review },
    { new: true, runValidators: true },
  );

  if (!updatedReview) {
    return res.status(404).json({ status: "fail", message: "No review found" });
  }
  await existingReview.save();
  res.status(200).json({ status: "success", data: updatedReview });
});

const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return res.status(404).json({ status: "fail", message: "No review found" });
  }

  res.status(204).json({ status: "success", data: null });
});

const getReviewByProductId = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ product_id: req.params.productId })
    .populate("product_id", "name -_id")
    .populate("user_id", "email -_id");

  res.status(200).json({ status: "success", data: reviews });
});

export {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReviewByProductId,
};
