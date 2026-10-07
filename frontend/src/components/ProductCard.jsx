import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/api";
import { useCart } from "../context/CartContext";
import ProductImage from "./ProductImage";
import { HeartIcon, PlusIcon } from "./Icons";
import { formatPrice, LOW_STOCK, stockText } from "../lib/format";

const EMPTY_WISHLIST = [];

const ProductCard = ({
  product,
  wishlist = EMPTY_WISHLIST,
  onWishlistChange,
}) => {
  const { cart, addToCart } = useCart();

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [notice, setNotice] = useState("");

  // Derived from the parent's wishlist; the parent updates it via onWishlistChange.
  const isWishlisted = Boolean(
    wishlist?.some((item) => item._id === product._id)
  );

  const cartItem = cart.find((item) => item.product?._id === product._id);
  const quantity = cartItem?.quantity || 0;

  const soldOut = product.stock <= 0;
  const atMax = !soldOut && quantity >= product.stock;
  const lowStock = !soldOut && product.stock <= LOW_STOCK;

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const handleWishlist = async () => {
    if (wishlistLoading || !wishlist) return;

    try {
      setWishlistLoading(true);
      await axiosInstance.post(`/customers/wishlist/${product._id}`);
      onWishlistChange?.(!isWishlisted);
    } catch (error) {
      console.log(error);
      flash(error.response?.data?.message || "Couldn't update saved items");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (cartLoading || soldOut || atMax) return;

    setCartLoading(true);
    const result = await addToCart(product._id);
    if (!result.success) flash(result.message);
    setCartLoading(false);
  };

  const addLabel = soldOut
    ? "Sold out"
    : atMax
      ? "All available units are in your bag"
      : `Add ${product.name} to bag`;

  return (
    <article className="group flex flex-col rounded-[26px] bg-white p-2.5">
      <div className="relative">
        <Link to={`/products/${product._id}`} aria-label={product.name}>
          <ProductImage
            product={product}
            className="aspect-[4/5] rounded-[18px]"
            imgClassName="transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        </Link>

        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1.5 text-[13px] text-ink backdrop-blur">
          {product.category}
        </span>

        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading || !wishlist}
          aria-label={isWishlisted ? "Remove from saved" : "Save for later"}
          aria-pressed={isWishlisted}
          className={`absolute right-2.5 top-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white transition active:scale-90 disabled:opacity-60 ${
            isWishlisted ? "text-heart" : "text-ink"
          }`}
        >
          <HeartIcon size={18} filled={isWishlisted} />
        </button>

        {soldOut && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink px-3 py-1.5 text-[13px] text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 px-2 pb-2 pt-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Link
            to={`/products/${product._id}`}
            className="truncate text-lg font-semibold tracking-[-0.01em] text-ink hover:text-ink-2"
          >
            {product.name}
          </Link>
          <span className="flex items-baseline gap-2.5">
            <span className="text-[17px] font-semibold text-ink">
              {formatPrice(product.price)}
            </span>
            <span className={`text-[13px] ${lowStock ? "text-warn" : "text-muted"}`}>
              {stockText(product.stock)}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={cartLoading || soldOut || atMax}
          aria-label={addLabel}
          title={addLabel}
          className={`flex h-12 min-w-12 shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-white transition active:scale-95 ${
            quantity ? "px-4" : ""
          } ${
            soldOut || atMax
              ? "cursor-not-allowed bg-disabled"
              : "bg-ink hover:bg-ink-2"
          }`}
        >
          {cartLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <PlusIcon size={18} />
          )}
          {quantity > 0 && <span>{quantity}</span>}
        </button>
      </div>

      {notice && (
        <p role="alert" className="mx-2 mb-2 rounded-2xl bg-paper px-3 py-2 text-[13px] text-warn">
          {notice}
        </p>
      )}
    </article>
  );
};

export default ProductCard;
