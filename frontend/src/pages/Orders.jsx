import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/api";
import Navbar from "../components/Navbar";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = () =>
    axiosInstance
      .get("/orders")
      .then(({ data }) => {
        setOrders(data.orders);
        setError("");
      })
      .catch(() => setError("Unable to load your orders."))
      .finally(() => setLoading(false));

  // Retry button: show the loader again, then reload.
  const fetchOrders = () => {
    setLoading(true);
    setError("");
    loadOrders();
  };

  useEffect(() => {
    loadOrders();
  }, []);

  let content;

  if (loading) {
    content = <p className="py-16 text-center text-gray-500">Loading orders...</p>;
  } else if (error) {
    content = (
      <div className="py-16 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 rounded-full bg-[#303030] px-6 py-3 text-sm font-semibold text-white hover:bg-[#ff6b35]"
        >
          Try Again
        </button>
      </div>
    );
  } else if (orders.length === 0) {
    content = (
      <div className="py-16 text-center">
        <p className="text-gray-600">You have not placed any orders yet.</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 rounded-full bg-[#303030] px-6 py-3 text-sm font-semibold text-white hover:bg-[#ff6b35]"
        >
          Start Shopping
        </button>
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-3xl border border-gray-200 bg-white p-6"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-bold">Order #{order._id.slice(-8)}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              {order.items.map((item) => (
                <li key={item._id}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">
                  Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-gray-500">Status: {order.status}</p>
              </div>
              <Link
                to={`/orders/${order._id}`}
                className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold hover:bg-[#303030] hover:text-white"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-4xl font-bold text-[#303030]">My Orders</h1>
        {content}
      </div>
    </div>
  );
};

export default Orders;
