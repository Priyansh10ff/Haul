import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axiosInstance from "../services/api";
import Navbar from "../components/Navbar";

const FIELDS = [
  { name: "fullName", label: "Full Name" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "addressLine1", label: "Address" },
  { name: "city", label: "City" },
  { name: "state", label: "State" },
  { name: "pincode", label: "Pincode" },
];

const validate = (values) => {
  const errors = {};

  for (const { name, label } of FIELDS) {
    if (!values[name].trim()) errors[name] = `${label} is required.`;
  }
  if (!errors.phone && !/^[6-9]\d{9}$/.test(values.phone.replace(/[\s-]/g, ""))) {
    errors.phone = "Phone must be a valid 10-digit number.";
  }
  if (!errors.pincode && !/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  return errors;
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading, subtotal, clearCart, fetchCart } = useCart();

  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const verifyPayment = async (orderId, response) => {
    try {
      await axiosInstance.post("/orders/verify-payment", {
        shopKartOrderId: orderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      clearCart();
      navigate(`/order-success/${orderId}`, { replace: true });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "We could not verify your payment. Your cart has not been cleared.",
      );
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);

    try {
      const shippingAddress = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value.trim()]),
      );

      const { data } = await axiosInstance.post(
        "/orders/create-payment-order",
        { shippingAddress },
      );

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setMessage("Unable to load Razorpay. Check your connection and retry.");
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,
        // Not proof of payment: the backend verifies the signature.
        handler: (response) => verifyPayment(data.shopKartOrderId, response),
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      razorpay.on("payment.failed", () => {
        axiosInstance
          .post("/orders/payment-failed", {
            shopKartOrderId: data.shopKartOrderId,
          })
          .catch(() => {});
        setMessage(
          "Payment failed. Your cart has not been cleared. Please try again.",
        );
        setSubmitting(false);
      });

      razorpay.open();
    } catch (error) {
      console.log(error);

      let reason = error.response?.data?.message;

      if (!reason && error.request && !error.response) {
        // Request went out but nothing came back: server down, wrong URL or CORS.
        reason = "Can't reach the server. Make sure the backend is running.";
      }

      setMessage(
        reason ||
          (error.response
            ? `Unable to place your order (error ${error.response.status}).`
            : `Unable to open payment: ${error.message}`),
      );
      // Stock or product changes may have happened; refresh the cart view.
      fetchCart();
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <Navbar />
        <p className="py-20 text-center text-gray-500">Loading checkout...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <Navbar />
        <div className="mx-auto mt-16 max-w-xl rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#303030]">
            Your cart is empty
          </h1>
          <p className="mt-2 text-gray-500">Add some products to checkout.</p>
          <button
            onClick={() => navigate("/products")}
            className="mt-6 rounded-full bg-[#303030] px-8 py-3 font-semibold text-white hover:bg-[#ff6b35]"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-bold text-[#303030]">Checkout</h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
        >
          <section className="rounded-3xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold">Shipping Details</h2>

            <div className="mt-5 space-y-4">
              {FIELDS.map(({ name, label, type }) => (
                <div key={name}>
                  <label htmlFor={name} className="text-sm font-medium">
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={type || "text"}
                    value={values[name]}
                    onChange={handleChange}
                    disabled={submitting}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-[#ff6b35]"
                  />
                  {errors[name] && (
                    <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="h-fit rounded-3xl bg-[#303030] p-6 text-white">
            <h2 className="text-xl font-bold">Order Summary</h2>

            <ul className="mt-5 space-y-3 text-sm">
              {cart.map((item) => (
                <li key={item.product._id} className="flex justify-between gap-4">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>
                    ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex justify-between border-t border-gray-700 pt-5 text-lg font-bold">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            {message && (
              <p className="mt-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-200">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-white px-6 py-4 font-bold text-[#303030] transition-all hover:bg-[#ff6b35] hover:text-white disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Place Order"}
            </button>
          </section>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
