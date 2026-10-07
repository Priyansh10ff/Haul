import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../services/api";
import Wordmark from "./Wordmark";
import { BagIcon, HeartIcon, LogoutIcon } from "./Icons";

const LINKS = [
  { to: "/products", label: "Shop" },
  { to: "/wishlist", label: "Saved" },
  { to: "/orders", label: "Orders" },
];

const linkClass = ({ isActive }) =>
  `text-[15px] transition-colors ${
    isActive ? "text-ink font-semibold" : "text-body hover:text-ink-2"
  }`;

const iconButton =
  "relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist";

const Navbar = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { customer, setCustomer } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await axiosInstance.post("/customers/logout");
    } catch (error) {
      // Clear the local session anyway; the cookie expires on its own.
      console.log(error);
    } finally {
      setCustomer(null);
      navigate("/login", { replace: true });
    }
  };

  const firstName = customer?.name?.split(" ")[0];

  return (
    <header className="py-5">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <nav className="hidden gap-7 md:flex">
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <Wordmark />

        <div className="flex items-center justify-end gap-1">
          {firstName && (
            <span className="mr-2 hidden text-[15px] text-muted lg:inline">
              Hi, {firstName}
            </span>
          )}

          <Link to="/wishlist" aria-label="Saved items" className={iconButton}>
            <HeartIcon />
          </Link>

          <Link
            to="/cart"
            aria-label={`Bag, ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
            className={iconButton}
          >
            <BagIcon />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1.5 text-[11px] font-semibold text-white"
              >
                {totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
            title="Log out"
            className={`${iconButton} disabled:opacity-50`}
          >
            <LogoutIcon />
          </button>
        </div>
      </div>

      {/* Mobile links */}
      <nav className="mt-4 flex gap-2 overflow-x-auto md:hidden">
        {LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `shrink-0 rounded-full border px-5 py-2.5 text-sm ${
                isActive
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-body"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;
