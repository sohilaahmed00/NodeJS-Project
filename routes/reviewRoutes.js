import { Router } from "express";
import { protect, restrictTo } from "../controllers/authController.js";
const router = Router();

import {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReviewByProductId,
} from "../controllers/reviewController.js";

router.route("/").get(getAllReviews);
router.get("/product/:productId", getReviewByProductId);

router.use(protect);
router.use(restrictTo("user"));

router.route("/product/:productId").post(createReview);
router.route("/:id").delete(deleteReview).patch(updateReview);

export default router;
