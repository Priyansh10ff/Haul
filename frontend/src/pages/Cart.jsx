import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Layout from "../components/Layout";
import ProductImage from "../components/ProductImage";
import { ArrowUpRight, LockIcon, MinusIcon, PlusIcon, TrashIcon } from "../components/Icons";
import { formatPrice, LOW_STOCK } from "../lib/format";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cart,
    loading,
    error,
    totalItems,
    subtotal,
    updateQuantity,
    removeFromCart,
    fetchCart,
  } = useCart();

  const [actionLoading, setActionLoading] = useState({});
  const [notice, setNotice] = useState("");

  const runAction = async (productId, action) => {
    setNotice("");
    setActionLoading((prev) => ({ ...prev, [productId]: true }));

    const result = await action();
    if (!result.success) setNotice(result.message);

    setActionLoading((prev) => ({ ...prev, [productId]: false }));
  };

  const handleQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    runAction(productId, () => updateQuantity(productId, newQuantity));
  };

  const handleRemove = (productId) => {
    runAction(productId, () => removeFromCart(productId));
  };

  let content;

  if (loading) {
    content = (
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-[156px] animate-pulse rounded-[26px] bg-white motion-reduce:animate-none" />
          ))}
        </div>
        <div className="h-[320px] rounded-[28px] bg-mist" />
      </div>
    );
  } else if (error) {
    content = (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center">
        <p className="text-2xl italic text-ink">We couldn’t load your bag.</p>
        <button
          type="button"
          onClick={fetchCart}
          className="mt-6 min-h-[52px] rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
        >
          Try again
        </button>
      </div>
    );
  } else if (cart.length === 0) {
    content = (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center">
        <p className="text-[28px] italic text-ink">Nothing in here yet.</p>
        <p className="mt-2 text-muted">Add something you like and it will wait for you here.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
        >
          Browse products
        </Link>
      </div>
    );
  } else {
    content = (
      <section className="grid items-start gap-4 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="flex min-w-0 flex-col gap-3">
          {notice && (
            <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-sm text-warn">
              {notice}
            </p>
          )}

          {cart.map((item) => {
            const product = item.product;
            const isLoading = actionLoading[product._id];
            const atMax = item.quantity >= product.stock;
            const low = product.stock <= LOW_STOCK;

            return (
              <div
                key={product._id}
                className={`grid grid-cols-[96px_1fr] gap-4 rounded-[26px] bg-white p-3 sm:grid-cols-[132px_1fr_auto] sm:items-center sm:gap-5 sm:pr-6 ${
                  isLoading ? "opacity-60" : ""
                }`}
              >
                <Link to={`/products/${product._id}`}>
                  <ProductImage
                    product={product}
                    className="h-24 w-24 rounded-[18px] sm:h-[132px] sm:w-[132px]"
                  />
                </Link>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] text-muted">{product.category}</span>
                  <Link
                    to={`/products/${product._id}`}
                    className="text-lg font-semibold tracking-[-0.01em] text-ink hover:text-ink-2 sm:text-xl"
                  >
                    {product.name}
                  </Link>
                  <span className={`text-sm ${low ? "text-warn" : "text-muted"}`}>
                    {atMax
                      ? "That’s all we have"
                      : low
                        ? `Only ${product.stock} left`
                        : `${formatPrice(product.price)} each`}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                  <span className="text-xl font-semibold text-ink">
                    {formatPrice(product.price * item.quantity)}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center rounded-full bg-paper">
                      <button
                        type="button"
                        onClick={() => handleQuantity(product._id, item.quantity - 1)}
                        disabled={isLoading || item.quantity <= 1}
                        aria-label={`Decrease quantity of ${product.name}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-mist disabled:text-disabled disabled:hover:bg-transparent"
                      >
                        <MinusIcon size={16} />
                      </button>
                      <span className="min-w-6 text-center font-semibold text-ink">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantity(product._id, item.quantity + 1)}
                        disabled={isLoading || atMax}
                        aria-label={`Increase quantity of ${product.name}`}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-mist disabled:text-disabled disabled:hover:bg-transparent"
                      >
                        <PlusIcon size={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      disabled={isLoading}
                      aria-label={`Remove ${product.name}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-faint transition hover:bg-paper hover:text-ink"
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="flex flex-col gap-5 rounded-[28px] bg-ink p-7 text-paper lg:sticky lg:top-6">
          <h2 className="text-[28px] font-medium italic tracking-[-0.03em]">Order summary</h2>
          <div className="flex flex-col gap-3 text-[15px]">
            <div className="flex justify-between">
              <span className="text-sage-soft">
                Subtotal · {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sage-soft">Shipping</span>
              <span className="font-semibold text-sage">Free</span>
            </div>
          </div>
          <div className="h-px bg-teal-line" />
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] text-sage-soft">Total</span>
            <span className="text-[40px] font-semibold tracking-[-0.04em]">{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="flex min-h-[58px] items-center justify-between rounded-full bg-paper pl-7 pr-2 text-base font-semibold text-ink transition hover:bg-white"
          >
            Checkout
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper">
              <ArrowUpRight size={18} />
            </span>
          </button>
          <p className="flex items-center gap-2 text-[13px] text-sage-soft">
            <LockIcon size={14} />
            Secure payment by Razorpay · UPI, cards, netbanking
          </p>
        </aside>
      </section>
    );
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-end justify-between gap-4 pb-8 pt-6">
        <h1 className="text-[48px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[72px]">
          Your bag
          {!loading && totalItems > 0 && (
            <span className="font-normal italic text-faint"> ({totalItems})</span>
          )}
        </h1>
        <Link to="/products" className="text-[15px] text-ink hover:text-ink-2">
          ← Continue shopping
        </Link>
      </div>
      {content}
    </Layout>
  );
};

export default Cart;
