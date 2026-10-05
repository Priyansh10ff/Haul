import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getOrders,
  getOrderById,
} from "../controllers/order.controller.js";

const orderRoutes = express.Router();

orderRoutes.post("/create-payment-order", isAuthenticated, createPaymentOrder);
orderRoutes.post("/verify-payment", isAuthenticated, verifyPayment);
orderRoutes.post("/payment-failed", isAuthenticated, markPaymentFailed);
orderRoutes.get("/", isAuthenticated, getOrders);
orderRoutes.get("/:id", isAuthenticated, getOrderById);

export default orderRoutes;
