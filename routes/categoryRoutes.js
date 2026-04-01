import { Router } from "express";
import upload from "../utils/multer.js";
import { protect, restrictTo } from "../controllers/authController.js";

import {
  getAllCategories,
  CreateCategory,
  deleteCategory,
  updateCategory,
  getCategoryByName,
} from "../controllers/categoryController.js";

const router = Router();

router.route("/").get(getAllCategories);

router.route("/:name").get(getCategoryByName);

router.use(protect);

router
  .route("/")
  .post(restrictTo("admin"), upload.single("image"), CreateCategory);
router
  .route("/:name")
  .delete(restrictTo("admin"), deleteCategory)
  .patch(restrictTo("admin"), upload.single("image"), updateCategory);

export default router;
