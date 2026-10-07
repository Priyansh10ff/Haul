import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

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

  const handleQuantity = async (
    productId,
    newQuantity
  ) => {
    if (newQuantity < 1) return;

    setActionLoading((prev) => ({
      ...prev,
      [productId]: true,
    }));

    const result = await updateQuantity(
      productId,
      newQuantity
    );

    if (!result.success) {
      alert(result.message);
    }

    setActionLoading((prev) => ({
      ...prev,
      [productId]: false,
    }));
  };

  const handleRemove = async (productId) => {
    setActionLoading((prev) => ({
      ...prev,
      [productId]: true,
    }));

    const result = await removeFromCart(productId);

    if (!result.success) {
      alert(result.message);
    }

    setActionLoading((prev) => ({
      ...prev,
      [productId]: false,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] text-center">
        <Navbar />
        <div className="px-4 py-20">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-12 shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#ff6b35]" />

          <h2 className="mt-5 text-lg font-semibold">
            Loading your cart...
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please wait a moment.
          </p>
        </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf9f7] text-center">
        <Navbar />
        <div className="px-4 py-20">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-12 shadow-sm">
          <div className="text-5xl">⚠️</div>

          <h2 className="mt-5 text-xl font-bold">
            Unable to load your cart
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Something went wrong while loading your cart.
          </p>

          <button
            onClick={fetchCart}
            className="mt-6 rounded-full bg-[#303030] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#ff6b35] active:scale-95"
          >
            Try Again
          </button>
        </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <Navbar />
        <div className="px-4 py-20">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm">
          <div className="text-6xl">🛒</div>

          <h1 className="mt-6 text-3xl font-bold text-[#303030]">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-md text-gray-500">
            Looks like you haven't added anything yet.
            Start exploring our products.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-8 rounded-full bg-[#303030] px-8 py-3 font-semibold text-white transition-all hover:bg-[#ff6b35] active:scale-95"
          >
            Browse Products →
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />

      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6b35]">
            ShopKart
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#303030]">
            Your Cart
          </h1>

          <p className="mt-2 text-gray-500">
            {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"} ready
            for checkout.
          </p>
        </div>
      </section>

      {/* Cart */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-4">
            {cart.map((item) => {
              const product = item.product;
              const isLoading =
                actionLoading[product._id];

              return (
                <div
                  key={product._id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-40 w-full rounded-2xl object-cover sm:h-32 sm:w-32"
                    />

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            {product.category}
                          </p>

                          <h2 className="mt-1 text-lg font-bold text-[#303030]">
                            {product.name}
                          </h2>
                        </div>

                        <button
                          onClick={() =>
                            handleRemove(product._id)
                          }
                          disabled={isLoading}
                          className="text-sm font-medium text-red-500 transition hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-auto flex flex-col gap-4 pt-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xl font-bold">
                            ₹
                            {product.price.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {product.stock} units available
                          </p>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-[#faf9f7] p-1">
                          <button
                            disabled={
                              isLoading ||
                              item.quantity <= 1
                            }
                            onClick={() =>
                              handleQuantity(
                                product._id,
                                item.quantity - 1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-white active:scale-90 disabled:opacity-30"
                          >
                            −
                          </button>

                          <span className="w-10 text-center text-sm font-bold">
                            {item.quantity}
                          </span>

                          <button
                            disabled={
                              isLoading ||
                              item.quantity >=
                                product.stock
                            }
                            onClick={() =>
                              handleQuantity(
                                product._id,
                                item.quantity + 1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-white active:scale-90 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="h-fit rounded-3xl bg-[#303030] p-6 text-white shadow-xl lg:sticky lg:top-6">
            <p className="text-sm text-gray-400">
              ORDER SUMMARY
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Almost there.
            </h2>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Items
                </span>

                <span>
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Subtotal
                </span>

                <span>
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Delivery
                </span>

                <span className="text-green-400">
                  Free
                </span>
              </div>

              <div className="border-t border-gray-700 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-2xl font-bold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="mt-8 w-full rounded-full bg-white px-6 py-4 font-bold text-[#303030] transition-all hover:bg-[#ff6b35] hover:text-white active:scale-95"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/products")}
              className="mt-3 w-full rounded-full border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-[#303030] active:scale-95"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cart;