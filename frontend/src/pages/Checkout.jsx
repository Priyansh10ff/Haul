import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import ProductImage from "../components/ProductImage";
import { LockIcon } from "../components/Icons";
import { formatPrice } from "../lib/format";

const FIELDS = [
  { name: "fullName", label: "Full name", autoComplete: "name", span: 2 },
  { name: "phone", label: "Mobile number", type: "tel", autoComplete: "tel", inputMode: "numeric" },
  { name: "pincode", label: "Pincode", autoComplete: "postal-code", inputMode: "numeric" },
  { name: "addressLine1", label: "Address", autoComplete: "street-address", span: 2 },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
];

const validate = (values) => {
  const errors = {};

  for (const { name, label } of FIELDS) {
    if (!values[name].trim()) errors[name] = `${label} is required.`;
  }
  if (!errors.phone && !/^[6-9]\d{9}$/.test(values.phone.replace(/[\s-]/g, ""))) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }
  if (!errors.pincode && !/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = "Pincode must be 6 digits.";
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
  const { cart, loading, subtotal, totalItems, clearCart, fetchCart } = useCart();

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
          "We could not verify your payment. Your bag has not been cleared.",
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
        setMessage("Unable to load Razorpay. Check your connection (or ad blocker) and retry.");
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "haul.",
        description: "haul order",
        order_id: data.razorpayOrderId,
        // Not proof of payment: the backend verifies the signature.
        handler: (response) => verifyPayment(data.shopKartOrderId, response),
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        theme: { color: "#0F3B37" },
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
        setMessage("Payment failed. Your bag has not been cleared. Please try again.");
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
      // Stock or product changes may have happened; refresh the bag.
      fetchCart();
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="grid gap-4 pt-6 lg:grid-cols-[1fr_400px]">
          <div className="h-[480px] animate-pulse rounded-[28px] bg-white motion-reduce:animate-none" />
          <div className="h-[420px] rounded-[28px] bg-mist" />
        </div>
      </Layout>
    );
  }

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="mt-6 rounded-[28px] bg-white px-6 py-20 text-center">
          <p className="text-[28px] italic text-ink">Your bag is empty.</p>
          <p className="mt-2 text-muted">Add something before checking out.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
          >
            Browse products
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-end justify-between gap-4 pb-8 pt-6">
        <h1 className="text-[48px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[72px]">
          Checkout
        </h1>
        <Link to="/cart" className="text-[15px] text-ink hover:text-ink-2">
          ← Back to bag
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid items-start gap-4 lg:grid-cols-[1fr_400px]">
        <section className="rounded-[28px] bg-white p-6 sm:p-8">
          <h2 className="text-[28px] font-medium italic tracking-[-0.03em] text-ink">Where should we ship it?</h2>
          <p className="mt-1 text-[15px] text-muted">Free delivery anywhere in India.</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {FIELDS.map(({ name, label, type, autoComplete, inputMode, span }) => (
              <div key={name} className={span === 2 ? "sm:col-span-2" : ""}>
                <label htmlFor={name} className="mb-2 block text-sm font-medium text-ink">
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type || "text"}
                  autoComplete={autoComplete}
                  inputMode={inputMode}
                  value={values[name]}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={errors[name] ? `${name}-error` : undefined}
                  className={`min-h-[52px] w-full rounded-full border bg-paper px-5 text-base text-body outline-none transition focus:bg-white disabled:opacity-60 ${
                    errors[name] ? "border-warn" : "border-line focus:border-ink"
                  }`}
                />
                {errors[name] && (
                  <p id={`${name}-error`} className="mt-1.5 px-5 text-sm text-warn">
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-5 rounded-[28px] bg-ink p-7 text-paper lg:sticky lg:top-6">
          <h2 className="text-[28px] font-medium italic tracking-[-0.03em]">Your order</h2>

          <ul className="flex flex-col gap-3">
            {cart.map((item) => (
              <li key={item.product._id} className="flex items-center gap-3">
                <ProductImage product={item.product} className="h-14 w-14 shrink-0 rounded-[14px]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{item.product.name}</span>
                  <span className="text-[13px] text-sage-soft">Qty {item.quantity}</span>
                </span>
                <span className="text-[15px]">{formatPrice(item.product.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="h-px bg-teal-line" />
          <div className="flex flex-col gap-2 text-[15px]">
            <div className="flex justify-between">
              <span className="text-sage-soft">Subtotal · {totalItems} {totalItems === 1 ? "item" : "items"}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sage-soft">Shipping</span>
              <span className="font-semibold text-sage">Free</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] text-sage-soft">Total</span>
            <span className="text-[40px] font-semibold tracking-[-0.04em]">{formatPrice(subtotal)}</span>
          </div>

          {message && (
            <p role="alert" className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-paper">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[58px] rounded-full bg-paper px-6 text-base font-semibold text-ink transition hover:bg-white disabled:opacity-60"
          >
            {submitting ? "Processing…" : `Pay ${formatPrice(subtotal)}`}
          </button>
          <p className="flex items-center gap-2 text-[13px] text-sage-soft">
            <LockIcon size={14} />
            Secure payment by Razorpay · UPI, cards, netbanking
          </p>
        </aside>
      </form>
    </Layout>
  );
};

export default Checkout;
