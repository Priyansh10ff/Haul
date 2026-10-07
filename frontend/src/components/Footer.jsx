import { Link } from "react-router-dom";
import Wordmark from "./Wordmark";

const Footer = () => (
  <footer className="mt-24 flex flex-wrap items-end justify-between gap-6 rounded-[28px] bg-mist p-8 sm:p-10">
    <div>
      <Wordmark className="text-[56px] sm:text-[64px]" />
      <p className="mt-3 text-[15px] text-muted">
        Bengaluru · Payments secured by Razorpay
      </p>
    </div>
    <nav className="flex flex-wrap gap-7 text-[15px] text-ink">
      <Link to="/products" className="hover:text-ink-2">Shop</Link>
      <Link to="/wishlist" className="hover:text-ink-2">Saved</Link>
      <Link to="/orders" className="hover:text-ink-2">Orders</Link>
      <Link to="/cart" className="hover:text-ink-2">Bag</Link>
    </nav>
  </footer>
);

export default Footer;
