import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import ProductImage from "../components/ProductImage";
import { HeartIcon, MinusIcon, PlusIcon, CheckIcon } from "../components/Icons";
import { formatPrice, LOW_STOCK, stockText } from "../lib/format";

const ProductDetails = () => {
  const { id } = useParams();
  const { cart, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [qty, setQty] = useState(1);

  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const cartItem = cart.find((item) => item.product?._id === product?._id);
  const inCart = cartItem?.quantity || 0;

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
        setIsWishlisted(
          currentWishlist.some((item) => item._id === currentProduct._id),
        );
      } catch (error) {
        console.log(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Add / remove from wishlist (the endpoint toggles)
  const handleWishlist = async () => {
    if (wishlistLoading || !product) return;

    try {
      setWishlistLoading(true);
      await axiosInstance.post(`/customers/wishlist/${product._id}`);
      setIsWishlisted((value) => !value);
    } catch (error) {
      console.log(error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const room = product ? product.stock - inCart : 0;
  const soldOut = product ? product.stock <= 0 : false;
  const full = !soldOut && room <= 0;
  const amount = Math.min(qty, Math.max(room, 1));

  const handleAddToCart = async () => {
    if (cartLoading || !product || soldOut || full) return;

    setCartLoading(true);
    setCartSuccess(false);
    setMessage("");

    // The API adds one unit per call; set the final quantity in one more call.
    let result = inCart
      ? { success: true }
      : await addToCart(product._id);

    const target = inCart + amount;
    if (result.success && target > Math.max(inCart, 1)) {
      result = await updateQuantity(product._id, target);
    }

    if (result.success) {
      setCartSuccess(true);
      setQty(1);
      setTimeout(() => setCartSuccess(false), 1800);
    } else {
      setMessage(result.message);
    }

    setCartLoading(false);
  };

  const lowStock = product && !soldOut && product.stock <= LOW_STOCK;

  return (
    <Layout>
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 pb-5 pt-1 text-sm text-muted">
        <Link to="/products" className="hover:text-ink">Shop</Link>
        {product && (
          <>
            <span>/</span>
            <Link
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="hover:text-ink"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-ink">{product.name}</span>
          </>
        )}
      </nav>

      {loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-[28px] bg-mist motion-reduce:animate-none" />
          <div className="min-h-[420px] rounded-[28px] bg-white" />
        </div>
      )}

      {!loading && (error || !product) && (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center">
          <p className="text-2xl italic text-ink">We couldn’t find that product.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
          >
            Back to shop
          </Link>
        </div>
      )}

      {!loading && !error && product && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="relative">
            <ProductImage product={product} className="aspect-square rounded-[28px]" />
            {(lowStock || soldOut) && (
              <span
                className={`absolute left-5 top-5 rounded-full px-4 py-2 text-sm font-semibold ${
                  soldOut ? "bg-ink text-white" : "bg-white text-warn"
                }`}
              >
                {stockText(product.stock)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-7 rounded-[28px] bg-white p-7 sm:p-10">
            <div>
              <span className="inline-block rounded-full bg-paper px-3 py-1.5 text-[13px] text-ink">
                {product.category}
              </span>
              <h1 className="mt-4 text-[40px] font-semibold leading-none tracking-[-0.045em] text-ink sm:text-[56px]">
                {product.name}
              </h1>
              <p className="mt-4 text-[32px] font-semibold tracking-[-0.02em] text-ink">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="text-[17px] leading-relaxed text-muted">{product.description}</p>

            <div className="flex justify-between text-sm">
              <span className="text-muted">Availability</span>
              <span className={`font-semibold ${lowStock || soldOut ? "text-warn" : "text-ink"}`}>
                {stockText(product.stock)}
                {inCart > 0 && ` · ${inCart} in your bag`}
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center rounded-full bg-paper">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={soldOut || full || qty <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-14 w-[52px] items-center justify-center rounded-full text-ink hover:bg-mist disabled:text-disabled disabled:hover:bg-transparent"
                >
                  <MinusIcon size={18} />
                </button>
                <span className="min-w-7 text-center text-[17px] font-semibold text-ink" aria-live="polite">
                  {amount}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(room, q + 1))}
                  disabled={soldOut || full || amount >= room}
                  aria-label="Increase quantity"
                  className="flex h-14 w-[52px] items-center justify-center rounded-full text-ink hover:bg-mist disabled:text-disabled disabled:hover:bg-transparent"
                >
                  <PlusIcon size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartLoading || soldOut || full}
                className={`flex min-h-14 flex-1 basis-56 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold text-white transition active:scale-[0.99] ${
                  soldOut || full
                    ? "cursor-not-allowed bg-disabled"
                    : cartSuccess
                      ? "bg-ink-2"
                      : "bg-ink hover:bg-ink-2"
                }`}
              >
                {cartLoading ? (
                  "Adding…"
                ) : cartSuccess ? (
                  <>
                    <CheckIcon size={18} /> Added to bag
                  </>
                ) : soldOut ? (
                  "Sold out"
                ) : full ? (
                  "All units are in your bag"
                ) : (
                  `Add to bag · ${formatPrice(product.price * amount)}`
                )}
              </button>

              <button
                type="button"
                onClick={handleWishlist}
                disabled={wishlistLoading}
                aria-label={isWishlisted ? "Remove from saved" : "Save for later"}
                aria-pressed={isWishlisted}
                className={`flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white transition hover:border-ink disabled:opacity-60 ${
                  isWishlisted ? "text-heart" : "text-ink"
                }`}
              >
                <HeartIcon filled={isWishlisted} />
              </button>
            </div>

            {message && (
              <p role="alert" className="rounded-2xl bg-paper px-4 py-3 text-sm text-warn">
                {message}
              </p>
            )}

            {inCart > 0 && (
              <Link to="/cart" className="text-[15px] font-semibold text-ink underline underline-offset-4">
                View your bag →
              </Link>
            )}

            <div className="mt-auto grid grid-cols-2 gap-2.5">
              <div className="rounded-[18px] bg-paper p-4">
                <div className="text-[13px] text-muted">Shipping</div>
                <div className="mt-1 text-[15px] font-semibold text-ink">Free, all of India</div>
              </div>
              <div className="rounded-[18px] bg-paper p-4">
                <div className="text-[13px] text-muted">Payment</div>
                <div className="mt-1 text-[15px] font-semibold text-ink">UPI, cards, netbanking</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetails;
