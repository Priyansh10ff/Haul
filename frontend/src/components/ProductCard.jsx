import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/api";
import { useCart } from "../context/CartContext";

const EMPTY_WISHLIST = [];

const ProductCard = ({
  product,
  wishlist = EMPTY_WISHLIST,
  onWishlistChange,
}) => {
  const navigate = useNavigate();

  const {
    cart,
    addToCart,
  } = useCart();

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Derived from the parent's wishlist; the parent updates it via onWishlistChange.
  const isWishlisted = Boolean(
    wishlist?.some((item) => item._id === product._id)
  );

  const cartItem = cart.find(
    (item) => item.product?._id === product._id
  );

  const quantity = cartItem?.quantity || 0;

  const handleWishlist = async () => {
    if (wishlistLoading || !wishlist) return;

    try {
      setWishlistLoading(true);

      await axiosInstance.post(
        `/customers/wishlist/${product._id}`
      );

      onWishlistChange?.(!isWishlisted);
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message || "Unable to update wishlist",
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (cartLoading || product.stock <= 0) return;

    setCartLoading(true);
    setCartSuccess(false);

    const result = await addToCart(product._id);

    if (result.success) {
      setCartSuccess(true);

      setTimeout(() => {
        setCartSuccess(false);
      }, 1500);
    } else {
      alert(result.message);
    }

    setCartLoading(false);
  };

  return (
    <div className="group overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-[#f5f2ed]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 backdrop-blur">
          {product.category}
        </span>

        {/* Wishlist */}
        <button
          type="button"
          disabled={wishlistLoading || !wishlist}
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-sm backdrop-blur transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-50"
        >
          {wishlistLoading
            ? "..."
            : isWishlisted
              ? "❤️"
              : "♡"}
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <h2 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold text-[#303030]">
          {product.name}
        </h2>

        <p className="mt-3 text-xl font-bold text-[#303030]">
          ₹{product.price.toLocaleString("en-IN")}
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

        {/* Cart status */}
        {quantity > 0 && (
          <div className="mt-3 rounded-xl bg-[#f5f2ed] px-4 py-2 text-center text-sm font-medium text-[#303030]">
            {quantity}{" "}
            {quantity === 1 ? "item" : "items"} in cart
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/products/${product._id}`)
            }
            className="rounded-full border border-gray-300 px-4 py-3 text-sm font-semibold text-[#303030] transition-all duration-200 hover:border-[#303030] hover:bg-[#303030] hover:text-white active:scale-95"
          >
            Details
          </button>

          <button
            type="button"
            disabled={
              cartLoading ||
              product.stock <= 0 ||
              quantity >= product.stock
            }
            onClick={handleAddToCart}
            className={`rounded-full px-4 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-95 ${
              cartSuccess
                ? "bg-green-600"
                : "bg-[#303030] hover:bg-[#ff6b35]"
            } disabled:cursor-not-allowed disabled:bg-gray-300`}
          >
            {cartLoading
              ? "Adding..."
              : cartSuccess
                ? "✓ Added"
                : product.stock <= 0
                  ? "Out of Stock"
                  : quantity >= product.stock
                  ? "Max Stock"
                  : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;