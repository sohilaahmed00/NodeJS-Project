import { APIError } from "../utils/apiError.js";
import Product from "../models/productModel.js";

const validateProductData = async (req, res, next) => {
  try {
    let { price, priceAfterDiscount, quantity } = req.body;

    if ((price && price < 0) || (priceAfterDiscount && priceAfterDiscount < 0)) {
      return next(
        new APIError("Price and Price After Discount must be positive numbers", 400)
      );
    }

    if (quantity && quantity < 0) {
      return next(new APIError("Quantity must be a positive number", 400));
    }

    // Fetch the existing product once (only if needed)
    const existingProduct = 
      req.params.id && (priceAfterDiscount === undefined || price === undefined)
        ? await Product.findById(req.params.id)
        : null;

    const resolvedPrice = price ?? existingProduct?.price ?? 0;
    const resolvedPriceAfterDiscount =
      priceAfterDiscount ?? existingProduct?.priceAfterDiscount ?? 0;

    if (Number(resolvedPriceAfterDiscount) > Number(resolvedPrice)) {
      return next(
        new APIError("Price After Discount cannot be greater than Price", 400)
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

const validateProductId = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return next(new APIError("No product found with that ID", 404));
    next();
  } catch (err) {
    next(err);
  }
};

export { validateProductData, validateProductId };