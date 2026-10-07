import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import { formatPrice } from "../lib/format";

const STATUS_LABEL = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const Orders = () => {
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
    content = (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-[26px] bg-white motion-reduce:animate-none" />
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center">
        <p className="text-2xl italic text-ink">{error}</p>
        <button
          type="button"
          onClick={fetchOrders}
          className="mt-6 min-h-[52px] rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
        >
          Try again
        </button>
      </div>
    );
  } else if (orders.length === 0) {
    content = (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center">
        <p className="text-[28px] italic text-ink">No orders yet.</p>
        <p className="mt-2 text-muted">When you check out, your orders show up here.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
        >
          Start shopping
        </Link>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="group grid gap-4 rounded-[26px] bg-white p-6 transition hover:shadow-[0_8px_30px_rgba(15,59,55,0.08)] sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-semibold text-ink">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span className="rounded-full bg-paper px-3 py-1 text-[13px] text-ink">
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>
                <p className="mt-2 truncate text-[15px] text-muted">
                  {formatDate(order.createdAt)} ·{" "}
                  {order.items.map((item) => item.name).join(", ")}
                </p>
              </div>
              <div className="flex items-center justify-between gap-6 sm:justify-end">
                <span className="text-right">
                  <span className="block text-xl font-semibold text-ink">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <span className="text-[13px] text-muted">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                </span>
                <span className="text-[15px] font-semibold text-ink group-hover:text-ink-2">View →</span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <Layout>
      <h1 className="pb-8 pt-6 text-[48px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[72px]">
        Orders
      </h1>
      {content}
    </Layout>
  );
};

export default Orders;
