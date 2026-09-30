import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/home"
          className="text-2xl font-bold tracking-tight transition-transform duration-200 hover:scale-[1.02]"
        >
          Shop<span className="text-[#ff6b35]">Kart</span>
        </Link>

        {/* Links */}
        <div className="hidden items-center gap-7 md:flex">
          <Link
            to="/home"
            className={`text-sm font-medium transition-colors ${
              isActive("/home")
                ? "text-[#ff6b35]"
                : "text-gray-600 hover:text-[#ff6b35]"
            }`}
          >
            Home
          </Link>

          <Link
            to="/products"
            className={`text-sm font-medium transition-colors ${
              isActive("/products")
                ? "text-[#ff6b35]"
                : "text-gray-600 hover:text-[#ff6b35]"
            }`}
          >
            Products
          </Link>

          <Link
            to="/wishlist"
            className={`text-sm font-medium transition-colors ${
              isActive("/wishlist")
                ? "text-[#ff6b35]"
                : "text-gray-600 hover:text-[#ff6b35]"
            }`}
          >
            Wishlist
          </Link>

          <Link
            to="/cart"
            className={`group relative flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive("/cart")
                ? "text-[#ff6b35]"
                : "text-gray-600 hover:text-[#ff6b35]"
            }`}
          >
            <span>Cart</span>

            {/* Count */}
            <span
              key={totalItems}
              className="flex h-6 min-w-6 animate-[pulse_0.3s_ease-out] items-center justify-center rounded-full bg-[#303030] px-1.5 text-xs font-bold text-white transition-transform"
            >
              {totalItems}
            </span>
          </Link>
        </div>

        {/* Mobile Cart */}
        <div className="flex items-center gap-4 md:hidden">
          <Link
            to="/wishlist"
            className={`text-sm font-semibold ${
              isActive("/wishlist")
                ? "text-[#ff6b35]"
                : "text-gray-600"
            }`}
          >
            Wishlist
          </Link>
          <Link
            to="/cart"
            aria-label={`Cart, ${totalItems} items`}
            className="flex items-center gap-2 rounded-full bg-[#f5f2ed] px-4 py-2 text-sm font-semibold transition-all hover:bg-[#303030] hover:text-white active:scale-95"
          >
            🛒
            <span>{totalItems}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;