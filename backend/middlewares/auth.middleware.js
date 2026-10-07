import jwt from "jsonwebtoken";
import customerModel from "../models/customer.model.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await customerModel
      .findById(decoded.customerId)
      .select("-password");

    // Token is valid but the account no longer exists.
    if (!customer) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};

export default isAuthenticated;
