import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const {
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const productIsWishlisted = isWishlisted(
    product._id,
  );

  const handleWishlist = async () => {
    try {
      if (productIsWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="group overflow-hidden rounded-3xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-[#f5f2ed]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Category */}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 backdrop-blur">
          {product.category}
        </span>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-sm backdrop-blur transition hover:scale-110"
        >
          {productIsWishlisted ? "❤️" : "♡"}
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

        {/* Add to Cart */}
        <button
          type="button"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
          className="mt-5 w-full rounded-full bg-[#303030] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6b35] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {product.stock === 0
            ? "Out of Stock"
            : "Add to Cart"}
        </button>

        {/* View Details */}
        <button
          type="button"
          onClick={() =>
            navigate(`/products/${product._id}`)
          }
          className="mt-3 w-full rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-[#303030] transition hover:bg-gray-100"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default ProductCard;