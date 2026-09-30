import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);

      try {
        const response =
          await axiosInstance.get("/products", {
            params: {
              search,
              category,
            },
          });

        setProducts(response.data.products);
      } catch (error) {
        console.log(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category]);

  const handleCategoryClick = (
    selectedCategory,
  ) => {
    setCategory(selectedCategory);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#303030]">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Shop
            <span className="text-[#ff6b35]">
              Kart
            </span>
          </h1>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="/home"
              className="transition hover:text-[#ff6b35]"
            >
              Home
            </a>

            <a
              href="/products"
              className="border-b-2 border-[#ff6b35] pb-1 text-[#ff6b35]"
            >
              Products
            </a>

            <a
              href="/wishlist"
              className="transition hover:text-[#ff6b35]"
            >
              Wishlist
            </a>

            <button
              type="button"
              onClick={() =>
                handleCategoryClick("")
              }
              className="transition hover:text-[#ff6b35]"
            >
              Categories
            </button>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/wishlist"
              className="text-sm font-semibold text-gray-600 transition hover:text-[#ff6b35] md:hidden"
            >
              Wishlist
            </a>

            <span className="hidden text-sm text-gray-500 sm:block">
              Discover more. Shop better.
            </span>

            <a
              href="/cart"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f2ed] text-lg"
            >
              🛒
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[#f1eee8]">
          <div className="grid items-center gap-8 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:px-16 lg:py-16">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#ff6b35]">
                ShopKart Collection
              </p>

              <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Discover Products
                <br />
                You’ll Love
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
                Explore our collection of quality
                products across electronics, fashion,
                books and home essentials.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");

                  document
                    .getElementById(
                      "products-section",
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
                className="mt-8 rounded-full bg-[#303030] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6b35]"
              >
                Explore Products →
              </button>
            </div>

            <div className="relative hidden min-h-[300px] lg:block">
              <div className="absolute right-12 top-6 h-48 w-48 rounded-full bg-[#ff6b35] opacity-90" />

              <div className="absolute bottom-2 right-24 h-52 w-52 rounded-full bg-[#e9c9aa]" />

              <div className="absolute right-0 top-16 rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-xs text-gray-500">
                  Explore
                </p>
                <p className="mt-1 text-lg font-semibold">
                  Electronics
                </p>
              </div>

              <div className="absolute bottom-10 left-10 rounded-2xl bg-white p-5 shadow-lg">
                <p className="text-xs text-gray-500">
                  Discover
                </p>
                <p className="mt-1 text-lg font-semibold">
                  Fashion
                </p>
              </div>

              <div className="absolute bottom-20 right-36 rounded-2xl bg-[#303030] px-6 py-5 text-white shadow-xl">
                <p className="text-xs text-gray-300">
                  ShopKart
                </p>
                <p className="mt-1 text-xl font-bold">
                  Everything you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-[#ff6b35]">
              EXPLORE
            </p>

            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Shop by Categories
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              handleCategoryClick("")
            }
            className="hidden text-sm font-medium transition hover:text-[#ff6b35] sm:block"
          >
            View All →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Electronics", "💻"],
            ["Fashion", "👕"],
            ["Books", "📚"],
            ["Home", "🏠"],
          ].map(([name, icon]) => (
            <button
              key={name}
              type="button"
              onClick={() =>
                handleCategoryClick(name)
              }
              className={`rounded-2xl border bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-md ${
                category === name
                  ? "border-[#ff6b35] ring-2 ring-[#ff6b35]/20"
                  : "border-gray-200"
              }`}
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f2ed] text-3xl">
                {icon}
              </div>

              <h3 className="font-semibold">
                {name}
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Shop Now →
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section
        id="products-section"
        className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      >
        <div className="mb-8">
          <p className="text-sm font-medium text-[#ff6b35]">
            OUR PRODUCTS
          </p>

          <div className="mt-2 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold">
                Explore Our Collection
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Find the right products for your
                everyday needs.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <SearchBar
                search={search}
                setSearch={setSearch}
              />

              <CategoryFilter
                category={category}
                setCategory={setCategory}
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
            <h2 className="text-lg text-gray-500">
              Loading products...
            </h2>
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
            <h2 className="text-lg text-red-600">
              Something went wrong while loading
              products.
            </h2>
          </div>
        )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
              <h2 className="text-lg text-gray-500">
                No products found.
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
                className="mt-5 rounded-full bg-[#303030] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#ff6b35]"
              >
                Clear Filters
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}
      </section>

      {/* Benefits */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-gray-200 px-4 py-8 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <div className="px-6 py-4 text-center">
            <p className="text-2xl">🚚</p>

            <h3 className="mt-2 font-semibold">
              Fast Delivery
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Quick and reliable shipping
            </p>
          </div>

          <div className="px-6 py-4 text-center">
            <p className="text-2xl">🔒</p>

            <h3 className="mt-2 font-semibold">
              Secure Shopping
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Safe and simple checkout
            </p>
          </div>

          <div className="px-6 py-4 text-center">
            <p className="text-2xl">✓</p>

            <h3 className="mt-2 font-semibold">
              Quality Products
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Products you can rely on
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;