import bcrypt from "bcrypt";
import mongoose from "mongoose";
import customer from "../models/customer.model.js";
import genToken from "../utils/generateToken.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Built per request so NODE_ENV from .env is already loaded.
// In production the frontend and API live on different domains, so the
// cookie must be SameSite=None + Secure for the browser to send it.
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // matches the 7d JWT expiry
  };
};

// Case-insensitive match so accounts created before emails were
// lowercased can still log in.
const emailCollation = { locale: "en", strength: 2 };

export const registerCustomer = async (req, res) => {
  const { name, password, phone } = req.body || {};
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  try {
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const emailExists = await customer
      .findOne({ email })
      .collation(emailCollation);

    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password should be greater than 6 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = await customer.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const token = genToken(newCustomer._id);
    res.cookie("token", token, getCookieOptions());

    const newCustomerObj = newCustomer.toObject();
    delete newCustomerObj.password;

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      newCustomer: newCustomerObj,
    });
  } catch (error) {
    // Two sign-ups with the same email at the same time.
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { password } = req.body || {};
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All field are required",
      });
    }

    const emailExists = await customer
      .findOne({ email })
      .collation(emailCollation);

    if (!emailExists) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const correctPassword = bcrypt.compareSync(password, emailExists.password);

    if (!correctPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = genToken(emailExists._id);
    res.cookie("token", token, getCookieOptions());

    const emailExistsObj = emailExists.toObject();
    delete emailExistsObj.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      emailExists: emailExistsObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getCustomer = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      customer: req.customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const logoutCustomer = async (req, res) => {
  try {
    // clearCookie must use the same path/sameSite/secure as when it was set.
    const { maxAge, ...clearOptions } = getCookieOptions();
    res.clearCookie("token", clearOptions);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must contain atleast 6 characters",
      });
    }

    const customerExists = await customer.findById(req.customer._id);

    if (!customerExists) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const correctPassword = bcrypt.compareSync(
      oldPassword,
      customerExists.password,
    );

    if (!correctPassword) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    customerExists.password = await bcrypt.hash(newPassword, 10);
    await customerExists.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateWishlist = async (req, res) => {
  try {
    const userId = req.customer._id;
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(userId);
    const product = await Product.findById(productId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const isAlreadyInWishlist = customer.wishlist.some(
      (id) => id.toString() === productId.toString(),
    );

    if (isAlreadyInWishlist) {
      customer.wishlist.pull(productId);

      await customer.save();

      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
      });
    }

    customer.wishlist.push(productId);

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.customer._id;

    const customer = await Customer.findById(userId).populate("wishlist");

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
