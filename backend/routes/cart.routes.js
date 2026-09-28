import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../controllers/cart.controller.js";

const cartRoutes = express.Router();

cartRoutes.post("/:productId", isAuthenticated, addToCart);

cartRoutes.get("/", isAuthenticated, getCart);

cartRoutes.patch("/:productId", isAuthenticated, updateCartQuantity);

cartRoutes.delete("/:productId", isAuthenticated, removeFromCart);

export default cartRoutes;
