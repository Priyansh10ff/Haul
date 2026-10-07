import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axiosInstance from "../services/api";
import Navbar from "../components/Navbar";

const ProductDetails = () => {
  const { id } = useParams();
  const { cart, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [error, setError] = useState(false);

  const cartItem = cart.find((item) => item.product?._id === product?._id);
  const quantity = cartItem?.quantity || 0;

  // Fetch product and wishlist
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);

      try {
        const [productResponse, wishlistResponse] = await Promise.all([
          axiosInstance.get(`/products/${id}`),
          axiosInstance.get("/customers/wishlist"),
        ]);

        const currentProduct = productResponse.data.product;
        const currentWishlist = wishlistResponse.data.wishlist || [];

        setProduct(currentProduct);

        const exists = currentWishlist.some(
          (item) => item._id === currentProduct._id,
        );

        setIsWishlisted(exists);
      } catch (error) {
        console.log(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Add / remove from wishlist
  const handleWishlist = async () => {
    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        await axiosInstance.post(`/customers/wishlist/${product._id}`);

        setIsWishlisted(false);
      } else {
        await axiosInstance.post(`/customers/wishlist/${product._id}`);

        setIsWishlisted(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (cartLoading || !product || quantity >= product.stock) return;

    setCartLoading(true);
    setCartSuccess(false);

    const result = await addToCart(product._id);

    if (result.success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 1500);
    } else {
      alert(result.message);
    }

    setCartLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 max-w-6xl">
        <Link
          to="/products"
          className="text-sm font-medium text-gray-500 transition hover:text-[#ff6b35]"
        >
          ← Back to products
        </Link>
      </div>

      {loading && (
        <div className="mx-auto max-w-6xl rounded-3xl bg-white py-20 text-center shadow-sm">
          <h2 className="text-lg text-[#777]">Loading product...</h2>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-6xl rounded-3xl bg-white py-20 text-center shadow-sm">
          <h2 className="text-lg text-red-600">
            Something went wrong while loading the product.
          </h2>
        </div>
      )}

      {!loading && !error && !product && (
        <div className="mx-auto max-w-6xl rounded-3xl bg-white py-20 text-center shadow-sm">
          <h2 className="text-lg text-[#777]">Product not found.</h2>
        </div>
      )}

      {!loading && !error && product && (
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Image */}
            <div className="h-80 bg-[#f5f2ed] md:h-full md:min-h-[550px]">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            {/* Product Information */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-sm font-medium uppercase tracking-wider text-[#ff6b35]">
                {product.category}
              </p>

              <h1 className="mt-2 text-3xl font-bold text-[#303030] sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-6 leading-7 text-[#666]">
                {product.description}
              </p>

              <p className="mt-6 text-3xl font-bold text-[#303030]">
                ₹{product.price.toLocaleString("en-IN")}
              </p>

              <p
                className={`mt-3 text-sm font-medium ${
                  product.stock > 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} units left`
                  : "Out of stock"}
              </p>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={`mt-8 w-full rounded-full px-6 py-3 font-semibold transition duration-300 ${
                  isWishlisted
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-[#303030] text-white hover:bg-[#ff6b35]"
                } ${
                  wishlistLoading
                    ? "cursor-not-allowed opacity-60"
                    : "hover:scale-[1.01] active:scale-[0.98]"
                }`}
              >
                {wishlistLoading
                  ? "Updating..."
                  : isWishlisted
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"}
              </button>

              {/* Cart Button */}
              <button
                type="button"
                disabled={
                  cartLoading ||
                  product.stock <= 0 ||
                  quantity >= product.stock
                }
                onClick={handleAddToCart}
                className={`mt-3 w-full rounded-full border border-[#303030] px-6 py-3 font-semibold transition duration-300 hover:bg-[#303030] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                  cartSuccess ? "border-green-600 bg-green-600 text-white" : "text-[#303030]"
                }`}
              >
                {cartLoading
                  ? "Adding..."
                  : cartSuccess
                    ? "Added to Cart"
                    : product.stock <= 0
                      ? "Out of Stock"
                      : quantity >= product.stock
                        ? "Max Stock in Cart"
                        : "Add to Cart"}
              </button>

              {quantity > 0 && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  {quantity} in your cart ·{" "}
                  <Link to="/cart" className="font-semibold text-[#303030] underline">
                    View cart
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProductDetails;