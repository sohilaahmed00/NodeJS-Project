import mongoose from "mongoose";
import Product from "./productModel.js";

const reviewSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be a number between 1 and 5"],
      max: [5, "Rating must be a number between 1 and 5"],
      required: true,
    },
    review: { type: String, required: true },
  },
  { timestamps: true },
);

// Static method: recalculate and push stats to Product
reviewSchema.statics.calcAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product_id: productId } },
    {
      $group: {
        _id: "$product_id",
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: "$rating" },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: result[0].ratingsQuantity,
      ratingsAverage: parseFloat(result[0].ratingsAverage.toFixed(1)),
    });
  } else {
    // No reviews left — reset to defaults
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 1,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRating(this.product_id);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.product_id);
  }
});

reviewSchema.post("deleteOne", { document: true }, async function () {
  await this.constructor.calcAverageRating(this.product_id);
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
