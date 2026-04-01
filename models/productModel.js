import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    price: {
      type: Number,
      min: [0, "Price must be a positive number"],
      required: true,
    },
    description: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, min: 0, required: true },
    sold: { type: Number, default: 0, min: 0 },
    priceAfterDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 1,
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    ratingsQuantity: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
