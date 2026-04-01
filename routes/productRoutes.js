import { Router } from "express";
import upload from "../utils/multer.js";
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

router
  .route("/")
  .get(getAllProducts)
  .post(upload.single("image"), validateProductData, createProduct);

router
  .route("/:id")
  .delete(validateProductId, deleteProduct)
  .patch(
    upload.single("image"),
    validateProductId,
    validateProductData,
    updateProduct,
  );

export default router;
