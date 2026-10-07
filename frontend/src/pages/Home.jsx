import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  { name: "Electronics", icon: "💻" },
  { name: "Fashion", icon: "👕" },
  { name: "Books", icon: "📚" },
  { name: "Home", icon: "🏠" },
];

const Home = () => {
  const { customer } = useAuth();
  const { totalItems } = useCart();
  const firstName = customer?.name?.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#303030]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="overflow-hidden rounded-[2rem] bg-[#f1eee8]">
          <div className="grid items-center gap-8 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:px-16 lg:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6b35]">
                {firstName ? `Welcome back, ${firstName}` : "Welcome to ShopKart"}
              </p>

              <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Discover products you’ll love.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-gray-600">
                Browse the catalogue, save favourites to your wishlist and
                check out securely with Razorpay.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="rounded-full bg-[#303030] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6b35]"
                >
                  Browse Products →
                </Link>

                {totalItems > 0 && (
                  <Link
                    to="/cart"
                    className="rounded-full border border-[#303030] px-7 py-3 text-sm font-semibold transition hover:bg-[#303030] hover:text-white"
                  >
                    View Cart ({totalItems})
                  </Link>
                )}
              </div>
            </div>

            <div className="relative hidden min-h-[280px] lg:block">
              <div className="absolute right-12 top-4 h-48 w-48 rounded-full bg-[#ff6b35] opacity-90" />
              <div className="absolute bottom-2 right-24 h-52 w-52 rounded-full bg-[#e9c9aa]" />
              <div className="absolute bottom-16 right-36 rounded-2xl bg-[#303030] px-6 py-5 text-white shadow-xl">
                <p className="text-xs text-gray-300">ShopKart</p>
                <p className="mt-1 text-xl font-bold">Everything you need.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mt-12">
          <p className="text-sm font-medium text-[#ff6b35]">EXPLORE</p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
            Shop by Category
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORIES.map(({ name, icon }) => (
              <Link
                key={name}
                to={`/products?category=${encodeURIComponent(name)}`}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#ff6b35] hover:shadow-md"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f2ed] text-3xl">
                  {icon}
                </div>
                <h3 className="font-semibold">{name}</h3>
                <p className="mt-1 text-xs text-gray-500">Shop Now →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { to: "/wishlist", title: "Wishlist", text: "Products you saved for later." },
            { to: "/orders", title: "Orders", text: "Track everything you have bought." },
            { to: "/cart", title: "Cart", text: "Review items and check out." },
          ].map(({ to, title, text }) => (
            <Link
              key={to}
              to={to}
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-bold">{title} →</h3>
              <p className="mt-1 text-sm text-gray-500">{text}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Home;
