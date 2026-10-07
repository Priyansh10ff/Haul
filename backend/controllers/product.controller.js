import Product from "../models/product.model.js";
import mongoose from "mongoose";
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Inavlid Price",
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        message: "Inavlid stock",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const query = {};

    if (typeof search === "string" && search.trim()) {
      // Escape regex characters so input like "(" can't break or slow the query.
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.name = {
        $regex: safeSearch,
        $options: "i",
      };
    }

    if (typeof category === "string" && category) {
      query.category = category;
    }

    const products = await Product.find(query).select(
      "name description price category image stock createdAt",
    );

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);


    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
