import { fileURLToPath } from "url";
import path from "path";
import express from "express";

import cartRouter from "./cartRoutes.js";
import couponRouter from "./couponRoutes.js";
import productRouter from "./productRoutes.js";
import categoryRouter from "./categoryRoutes.js";
import reviewsRouter from "./reviewRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mountRoutes = (app) => {
  app.use("/cart", cartRouter);
  app.use("/coupons", couponRouter);
  app.use("/products", productRouter);
  app.use("/categories", categoryRouter);
  app.use("/reviews", reviewsRouter);
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
};

export { mountRoutes };
