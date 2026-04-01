import { Router } from "express";
import upload from "../utils/multer.js";
import {
  getAllCategories,
  CreateCategory,
  deleteCategory,
  updateCategory,
  getCategoryByName,
} from "../controllers/categoryController.js";

const router = Router();

router
  .route("/")
  .get(getAllCategories)
  .post(upload.single("image"), CreateCategory);

router
  .route("/:name")
  .get(getCategoryByName)
  .delete(deleteCategory)
  .patch(upload.single("image"), updateCategory);

export default router;
