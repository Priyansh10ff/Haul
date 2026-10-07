import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import ProductImage from "../components/ProductImage";
import { HeartIcon, MinusIcon, PlusIcon, CheckIcon, TrashIcon } from "../components/Icons";
import { formatPrice, LOW_STOCK, stockText } from "../lib/format";

const ProductDetails = () => {
  const { id } = useParams();
  const { cart, addToCart, updateQuantity, removeFromCart, syncCart } = useCart();

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
          // Make sure the bag quantity shown here is the latest.
          syncCart(),
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
  }, [id, syncCart]);

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

  const soldOut = product ? product.stock <= 0 : false;
  const stock = product?.stock || 0;
  // Before the item is in the bag the stepper picks how many to add.
  // Once it is in the bag the stepper edits the bag quantity directly,
  // so it always matches what the Shop page and the bag show.
  const pickQty = Math.min(qty, Math.max(stock, 1));
  const shownQty = inCart > 0 ? inCart : pickQty;
  const canIncrease = inCart > 0 ? inCart < stock : pickQty < stock;
  const canDecrease = inCart > 0 ? true : pickQty > 1;

  const run = async (action) => {
    setCartLoading(true);
    setMessage("");
    const result = await action();
    if (!result.success) setMessage(result.message);
    setCartLoading(false);
    return result;
  };

  const handleIncrease = () => {
    if (cartLoading || !canIncrease) return;
    if (inCart > 0) {
      run(() => updateQuantity(product._id, inCart + 1));
    } else {
      setQty(pickQty + 1);
    }
  };

  const handleDecrease = () => {
    if (cartLoading || !canDecrease) return;
    if (inCart > 1) {
      run(() => updateQuantity(product._id, inCart - 1));
    } else if (inCart === 1) {
      run(() => removeFromCart(product._id));
      setQty(1);
    } else {
      setQty(pickQty - 1);
    }
  };

  const handleAddToCart = async () => {
    if (cartLoading || !product || soldOut || inCart > 0) return;

    setCartSuccess(false);

    const result = await run(async () => {
      // The API adds one unit per call; set the chosen quantity in one more call.
      const added = await addToCart(product._id);
      if (!added.success || pickQty <= 1) return added;
      return updateQuantity(product._id, pickQty);
    });

    if (result.success) {
      setCartSuccess(true);
      setQty(1);
      setTimeout(() => setCartSuccess(false), 1800);
    }
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

            {inCart > 0 && (
              <p className="-mb-3 text-sm font-medium text-ink">In your bag</p>
            )}

            <div className="flex flex-wrap gap-2.5">
              <div className={`flex items-center rounded-full ${inCart > 0 ? "bg-ink/5 ring-1 ring-ink/15" : "bg-paper"}`}>
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={soldOut || cartLoading || !canDecrease}
                  aria-label={inCart === 1 ? "Remove from bag" : "Decrease quantity"}
                  className="flex h-14 w-[52px] items-center justify-center rounded-full text-ink hover:bg-mist disabled:text-disabled disabled:hover:bg-transparent"
                >
                  {inCart === 1 ? <TrashIcon size={18} /> : <MinusIcon size={18} />}
                </button>
                <span className="min-w-7 text-center text-[17px] font-semibold text-ink" aria-live="polite">
                  {soldOut ? 0 : shownQty}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={soldOut || cartLoading || !canIncrease}
                  aria-label="Increase quantity"
                  title={!canIncrease && !soldOut ? `Only ${stock} available` : undefined}
                  className="flex h-14 w-[52px] items-center justify-center rounded-full text-ink hover:bg-mist disabled:text-disabled disabled:hover:bg-transparent"
                >
                  <PlusIcon size={18} />
                </button>
              </div>

              {inCart > 0 ? (
                <Link
                  to="/cart"
                  className="flex min-h-14 flex-1 basis-56 items-center justify-center gap-2 rounded-full bg-ink px-6 text-base font-semibold text-white transition hover:bg-ink-2"
                >
                  {cartSuccess ? (
                    <>
                      <CheckIcon size={18} /> Added · View bag
                    </>
                  ) : (
                    `View bag · ${formatPrice(product.price * inCart)}`
                  )}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartLoading || soldOut}
                  className={`flex min-h-14 flex-1 basis-56 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold text-white transition active:scale-[0.99] ${
                    soldOut ? "cursor-not-allowed bg-disabled" : "bg-ink hover:bg-ink-2"
                  }`}
                >
                  {cartLoading
                    ? "Adding…"
                    : soldOut
                      ? "Sold out"
                      : `Add to bag · ${formatPrice(product.price * pickQty)}`}
                </button>
              )}

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

            {inCart > 0 && !soldOut && (
              <p className="-mt-3 text-sm text-muted">
                {canIncrease
                  ? `You can add ${stock - inCart} more.`
                  : `That’s all ${stock} we have, and they’re in your bag.`}
              </p>
            )}

            {message && (
              <p role="alert" className="rounded-2xl bg-paper px-4 py-3 text-sm text-warn">
                {message}
              </p>
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
