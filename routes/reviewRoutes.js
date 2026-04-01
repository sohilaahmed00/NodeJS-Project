import { Router } from "express";

const router = Router();

import {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReviewByProductId,
} from "../controllers/reviewController.js";

router.route("/").get(getAllReviews).post(createReview);
router.route("/:id").delete(deleteReview).patch(updateReview);
router.get("/product/:productId", getReviewByProductId);

export default router;