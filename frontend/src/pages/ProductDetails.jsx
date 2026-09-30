import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import axiosInstance from "../services/api";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [cartLoading, setCartLoading] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(false);

      try {
        const response =
          await axiosInstance.get(
            `/products/${id}`,
          );

        setProduct(response.data.product);
      } catch (error) {
        console.log(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const productIsWishlisted =
    product && isWishlisted(product._id);

  const handleWishlist = async () => {
    if (!product) return;

    try {
      setWishlistLoading(true);

      if (productIsWishlisted) {
        await removeFromWishlist(
          product._id,
        );
      } else {
        await addToWishlist(
          product._id,
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setCartLoading(true);

      await addToCart(product._id);
    } catch (error) {
      console.log(error);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() =>
            navigate("/products")
          }
          className="mb-6 text-sm font-medium text-gray-600 hover:text-[#ff6b35]"
        >
          ← Back to Products
        </button>

        {loading && (
          <h2 className="text-center text-lg text-[#777]">
            Loading product...
          </h2>
        )}

        {error && (
          <h2 className="text-center text-lg text-red-600">
            Something went wrong while loading
            the product.
          </h2>
        )}

        {!loading &&
          !error &&
          !product && (
            <h2 className="text-center text-lg text-[#777]">
              Product not found.
            </h2>
          )}

        {!loading &&
          !error &&
          product && (
            <div className="grid grid-cols-1 gap-8 overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">
              {/* Image */}
              <div className="h-80 bg-[#f5f2ed] md:h-full md:min-h-[500px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="text-sm text-[#777]">
                  {product.category}
                </p>

                <h1 className="mt-2 text-3xl font-bold text-[#303030] sm:text-4xl">
                  {product.name}
                </h1>

                <p className="mt-6 leading-7 text-[#666]">
                  {product.description}
                </p>

                <p className="mt-6 text-2xl font-semibold text-[#303030]">
                  ₹
                  {product.price.toLocaleString(
                    "en-IN",
                  )}
                </p>

                <p
                  className={`mt-3 text-sm font-medium ${
                    product.stock > 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} units left`
                    : "Out of stock"}
                </p>

                {/* Wishlist */}
                <button
                  type="button"
                  disabled={
                    wishlistLoading
                  }
                  onClick={
                    handleWishlist
                  }
                  className={`mt-8 w-full rounded-full border px-6 py-3 font-medium transition ${
                    productIsWishlisted
                      ? "border-red-300 bg-red-50 text-red-600"
                      : "border-gray-300 text-[#303030] hover:bg-gray-100"
                  }`}
                >
                  {wishlistLoading
                    ? "Updating..."
                    : productIsWishlisted
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"}
                </button>

                {/* Cart */}
                <button
                  type="button"
                  disabled={
                    product.stock === 0 ||
                    cartLoading
                  }
                  onClick={
                    handleAddToCart
                  }
                  className="mt-3 w-full rounded-full bg-[#303030] px-6 py-3 font-medium text-white transition hover:bg-[#ff6b35] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cartLoading
                    ? "Adding..."
                    : product.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ProductDetails;