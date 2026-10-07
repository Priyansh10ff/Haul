import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../services/api";

const LINKS = [
  { to: "/home", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/orders", label: "Orders" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { customer, setCustomer } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (path) => {
    if (path === "/products") return location.pathname.startsWith("/products");
    if (path === "/orders") return location.pathname.startsWith("/orders");
    return location.pathname === path;
  };

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
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/home"
          className="text-2xl font-bold tracking-tight transition-transform duration-200 hover:scale-[1.02]"
        >
          Shop<span className="text-[#ff6b35]">Kart</span>
        </Link>

        {/* Links */}
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors ${
                isActive(to)
                  ? "text-[#ff6b35]"
                  : "text-gray-600 hover:text-[#ff6b35]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {firstName && (
            <span className="hidden text-sm text-gray-500 lg:block">
              Hi, {firstName}
            </span>
          )}

          <Link
            to="/cart"
            aria-label={`Cart, ${totalItems} items`}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
              isActive("/cart")
                ? "bg-[#303030] text-white"
                : "bg-[#f5f2ed] text-[#303030] hover:bg-[#303030] hover:text-white"
            }`}
          >
            <span>Cart</span>
            <span
              key={totalItems}
              className="flex h-6 min-w-6 animate-[pulse_0.3s_ease-out] items-center justify-center rounded-full bg-[#ff6b35] px-1.5 text-xs font-bold text-white"
            >
              {totalItems}
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-[#303030] hover:text-[#303030] active:scale-95 disabled:opacity-50"
          >
            {loggingOut ? "..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Mobile links */}
      <div className="flex gap-2 overflow-x-auto border-t border-gray-100 px-4 py-2 md:hidden">
        {LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
              isActive(to)
                ? "bg-[#ff6b35] text-white"
                : "text-gray-600 hover:bg-[#f5f2ed]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
