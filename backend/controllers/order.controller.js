import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { getRazorpay } from "../config/razorpay.js";

const ADDRESS_FIELDS = [
  "fullName",
  "phone",
  "addressLine1",
  "city",
  "state",
  "pincode",
];

// Returns { address } with trimmed values, or { error }.
const validateShippingAddress = (input) => {
  if (!input || typeof input !== "object") {
    return { error: "Shipping address is required" };
  }

  const address = {};
  for (const field of ADDRESS_FIELDS) {
    const value = typeof input[field] === "string" ? input[field].trim() : "";
    if (!value) return { error: `${field} is required` };
    address[field] = value;
  }

  const phone = address.phone.replace(/[\s-]/g, "");
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { error: "Phone must be a valid 10-digit number" };
  }
  if (!/^\d{6}$/.test(address.pincode)) {
    return { error: "Pincode must contain 6 digits" };
  }

  address.phone = phone;
  return { address };
};

const serverError = (res, error) => {
  console.log(error);
  return res
    .status(500)
    .json({ success: false, message: "Internal Server Error" });
};

export const createPaymentOrder = async (req, res) => {
  try {
    // Fail early with a clear reason instead of a generic payment error.
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.log(
        "Razorpay keys missing: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env and restart the server.",
      );
      return res.status(503).json({
        success: false,
        message: "Payments are not configured on the server yet.",
      });
    }

    // Only the shipping address is read from the body; totals/items are ignored.
    const { address, error } = validateShippingAddress(
      req.body?.shippingAddress,
    );
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const customer = await Customer.findById(req.customer._id).populate(
      "cart.product",
    );

    if (!customer.cart.length) {
      return res
        .status(400)
        .json({ success: false, message: "Your cart is empty" });
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product; // null if the product was deleted

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "A product in your cart is no longer available. Please remove it and try again.",
        });
      }
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
      totalAmount += product.price * cartItem.quantity;
    }

    const order = await Order.create({
      user: customer._id,
      items,
      shippingAddress: address,
      totalAmount,
    });

    try {
      const razorpayOrder = await getRazorpay().orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order._id.toString(),
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        success: true,
        shopKartOrderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch (paymentError) {
      // Don't leave an orphaned pending order; the cart is untouched.
      await Order.deleteOne({ _id: order._id });
      // Razorpay SDK errors are plain objects: { statusCode, error: { description } }
      const reason =
        paymentError.error?.description || paymentError.message || "unknown error";
      console.log("Razorpay order creation failed:", reason);

      // Show the real reason while developing; keep it generic in production.
      const isProduction = process.env.NODE_ENV === "production";
      return res.status(502).json({
        success: false,
        message: isProduction
          ? "Unable to start payment. Please try again."
          : `Unable to start payment: ${reason}`,
      });
    }
  } catch (error) {
    return serverError(res, error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (
      !mongoose.isValidObjectId(shopKartOrderId) ||
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment details" });
    }

    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.customer._id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Idempotent: already confirmed (e.g. double submit).
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({ success: true, order });
    }

    // The order id we stored is the trusted one, not the browser's.
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(razorpay_signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Atomic switch to PAID: if two verify requests race, only one wins,
    // so stock is reduced exactly once.
    const paidOrder = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: "PAID" } },
      {
        $set: {
          paymentStatus: "PAID",
          status: "PLACED",
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { returnDocument: "after" },
    );

    if (!paidOrder) {
      const current = await Order.findById(order._id);
      return res.status(200).json({ success: true, order: current });
    }

    // Stock is reduced only after payment is confirmed. The $gte guard keeps
    // stock from going negative if two customers paid for the last unit.
    for (const item of paidOrder.items) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );

      if (result.modifiedCount === 0) {
        console.log(
          `Stock conflict: order ${paidOrder._id} is paid but "${item.name}" no longer has ${item.quantity} in stock. Restock or refund manually.`,
        );
      }
    }

    await Customer.updateOne({ _id: req.customer._id }, { $set: { cart: [] } });

    return res.status(200).json({ success: true, order: paidOrder });
  } catch (error) {
    return serverError(res, error);
  }
};

export const markPaymentFailed = async (req, res) => {
  try {
    const { shopKartOrderId } = req.body || {};
    if (!mongoose.isValidObjectId(shopKartOrderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id" });
    }

    // Only a still-pending order can be marked failed; never downgrade a paid one.
    await Order.updateOne(
      {
        _id: shopKartOrderId,
        user: req.customer._id,
        paymentStatus: "PENDING",
      },
      { $set: { paymentStatus: "FAILED" } },
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return serverError(res, error);
  }
};

// History only lists paid orders; abandoned or failed attempts are hidden.
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.customer._id,
      paymentStatus: "PAID",
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return serverError(res, error);
  }
};

export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Scoping by user makes another user's order look like a missing one.
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.customer._id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return serverError(res, error);
  }
};
