import { Router } from "express";
import upload from "../utils/multer.js";
import { protect, restrictTo } from "../controllers/authController.js";

import {
  validateProductData,
  validateProductId,
} from "../middleware/productValidation.js";
import {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductByPrice,
  searchProductsByName,
  filterByCategory,
} from "../controllers/productController.js";

const router = Router();

router.get("/price/:price", getProductByPrice);
router.get("/search", searchProductsByName);
router.get("/filter", filterByCategory);

router.route("/").get(getAllProducts);

router.use(protect);
router
  .route("/")
  .post(
    restrictTo("admin"),
    upload.single("image"),
    validateProductData,
    createProduct,
  );

router
  .route("/:id")
  .delete(restrictTo("admin"), validateProductId, deleteProduct)
  .patch(
    restrictTo("admin"),
    upload.single("image"),
    validateProductId,
    validateProductData,
    updateProduct,
  );

export default router;
