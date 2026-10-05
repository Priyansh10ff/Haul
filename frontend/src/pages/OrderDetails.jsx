import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axiosInstance from "../services/api";
import Navbar from "../components/Navbar";

// Serves both /orders/:id and the post-payment /order-success/:id screen.
const OrderDetails = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const isSuccess = pathname.startsWith("/order-success");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosInstance.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load this order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  let content;

  if (loading) {
    content = <p className="py-16 text-center text-gray-500">Loading order...</p>;
  } else if (error) {
    content = <p className="py-16 text-center text-red-600">{error}</p>;
  } else {
    const address = order.shippingAddress;

    content = (
      <div className="rounded-3xl border border-gray-200 bg-white p-8">
        {isSuccess && (
          <div className="mb-6 text-center">
            <div className="text-5xl">✅</div>
            <h1 className="mt-3 text-3xl font-bold text-[#303030]">
              Order Placed Successfully
            </h1>
            <p className="mt-1 text-gray-500">
              Your order has been saved successfully.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500">Order ID</p>
        <p className="break-all font-mono text-sm">{order._id}</p>

        <ul className="mt-6 divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item._id} className="flex justify-between gap-4 py-3">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
        </div>

        <p className="mt-4 text-sm">
          <span className="text-gray-500">Status: </span>
          <span className="font-semibold">{order.status}</span>
        </p>

        <p className="mt-4 text-sm text-gray-600">
          Ships to {address.fullName}, {address.addressLine1}, {address.city},{" "}
          {address.state} {address.pincode} · {address.phone}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="rounded-full bg-[#303030] px-6 py-3 text-sm font-semibold text-white hover:bg-[#ff6b35]"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold hover:bg-[#303030] hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">{content}</div>
    </div>
  );
};

export default OrderDetails;
