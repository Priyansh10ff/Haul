import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    loading,
    error,
    subtotal,
    updateQuantity,
    removeFromCart,
    fetchCart,
  } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] py-20 text-center">
        <h2 className="text-lg text-gray-500">
          Loading your cart...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf9f7] py-20 text-center">
        <h2 className="text-lg text-red-600">
          Unable to load your cart.
        </h2>

        <button
          onClick={fetchCart}
          className="mt-5 rounded-full bg-[#303030] px-6 py-3 text-sm text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f7] py-20 text-center">
        <p className="text-5xl">
          🛒
        </p>

        <h2 className="mt-5 text-2xl font-bold">
          Your cart is empty
        </h2>

        <p className="mt-2 text-gray-500">
          Looks like you haven't added anything yet.
        </p>

        <button
          onClick={() =>
            navigate("/products")
          }
          className="mt-6 rounded-full bg-[#303030] px-6 py-3 text-sm font-semibold text-white"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            My Cart
          </h1>

          <button
            onClick={() =>
              navigate("/products")
            }
            className="text-sm font-medium text-[#ff6b35]"
          >
            Continue Shopping
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item.product._id}
                className="flex gap-5 rounded-3xl bg-white p-5 shadow-sm"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-28 w-28 rounded-2xl object-cover"
                />

                <div className="flex flex-1 flex-col">
                  <h2 className="text-lg font-semibold">
                    {item.product.name}
                  </h2>

                  <p className="mt-2 font-semibold">
                    ₹
                    {item.product.price.toLocaleString(
                      "en-IN",
                    )}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Stock: {item.product.stock}
                  </p>

                  <div className="mt-auto flex items-center gap-3">
                    <button
                      disabled={
                        item.quantity === 1
                      }
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity - 1,
                        )
                      }
                      className="h-9 w-9 rounded-full border disabled:opacity-40"
                    >
                      -
                    </button>

                    <span className="min-w-6 text-center font-medium">
                      {item.quantity}
                    </span>

                    <button
                      disabled={
                        item.quantity >=
                        item.product.stock
                      }
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity + 1,
                        )
                      }
                      className="h-9 w-9 rounded-full border disabled:opacity-40"
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        removeFromCart(
                          item.product._id,
                        )
                      }
                      className="ml-4 text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="font-semibold">
                  ₹
                  {(
                    item.product.price *
                    item.quantity
                  ).toLocaleString(
                    "en-IN",
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Order Summary
            </h2>

            <div className="mt-6 flex justify-between">
              <span className="text-gray-500">
                Items
              </span>

              <span>
                {cartItems.reduce(
                  (total, item) =>
                    total + item.quantity,
                  0,
                )}
              </span>
            </div>

            <div className="mt-4 flex justify-between">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-semibold">
                ₹
                {subtotal.toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>

            <div className="my-6 border-t border-gray-200" />

            <div className="flex justify-between text-lg font-bold">
              <span>
                Total
              </span>

              <span>
                ₹
                {subtotal.toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>

            <button
              type="button"
              className="mt-8 w-full rounded-full bg-[#303030] px-6 py-3 font-semibold text-white transition hover:bg-[#ff6b35]"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;