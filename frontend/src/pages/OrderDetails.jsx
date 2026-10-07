import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import { CheckIcon } from "../components/Icons";
import { formatPrice } from "../lib/format";

const STATUS_LABEL = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  PENDING_PAYMENT: "Awaiting payment",
};

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
    content = <div className="h-[480px] animate-pulse rounded-[28px] bg-white motion-reduce:animate-none" />;
  } else if (error) {
    content = (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center">
        <p className="text-2xl italic text-ink">{error}</p>
        <Link
          to="/orders"
          className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
        >
          All orders
        </Link>
      </div>
    );
  } else {
    const address = order.shippingAddress;

    content = (
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_380px]">
        <section className="rounded-[28px] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[28px] font-medium italic tracking-[-0.03em] text-ink">Items</h2>
            <span className="rounded-full bg-paper px-3 py-1.5 text-[13px] text-ink">
              {STATUS_LABEL[order.status] || order.status}
            </span>
          </div>
          <ul className="mt-5 divide-y divide-line">
            {order.items.map((item) => (
              <li key={item._id} className="flex items-center justify-between gap-4 py-4">
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-semibold text-ink">{item.name}</span>
                  <span className="text-sm text-muted">
                    {item.quantity} × {formatPrice(item.price)}
                  </span>
                </span>
                <span className="text-[17px] font-semibold text-ink">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex flex-col gap-5 rounded-[28px] bg-ink p-7 text-paper">
          <div>
            <p className="text-[13px] text-sage-soft">Order</p>
            <p className="mt-1 break-all text-[15px]">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-[13px] text-sage-soft">Placed on</p>
            <p className="mt-1 text-[15px]">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-[13px] text-sage-soft">Ships to</p>
            <p className="mt-1 text-[15px] leading-relaxed">
              {address.fullName}
              <br />
              {address.addressLine1}, {address.city}
              <br />
              {address.state} {address.pincode} · {address.phone}
            </p>
          </div>
          <div className="h-px bg-teal-line" />
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] text-sage-soft">Paid</span>
            <span className="text-[36px] font-semibold tracking-[-0.04em]">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <Layout>
      <div className="pb-8 pt-6">
        {isSuccess && !loading && !error ? (
          <div className="flex flex-col items-start gap-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-ink">
              <CheckIcon size={26} />
            </span>
            <h1 className="text-[48px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[72px]">
              Order placed.
            </h1>
            <p className="max-w-[520px] text-[17px] leading-relaxed text-muted">
              Your payment went through and your order is on its way to being packed.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-[48px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[72px]">
              Order details
            </h1>
            <Link to="/orders" className="text-[15px] text-ink hover:text-ink-2">
              ← All orders
            </Link>
          </div>
        )}
      </div>

      {content}

      {isSuccess && !loading && !error && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
          >
            View my orders
          </Link>
          <Link
            to="/products"
            className="inline-flex min-h-[52px] items-center rounded-full border border-line bg-white px-7 font-semibold text-ink hover:border-ink"
          >
            Keep shopping
          </Link>
        </div>
      )}
    </Layout>
  );
};

export default OrderDetails;
