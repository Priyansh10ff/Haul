import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import axiosInstance from "../services/api";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";

const SkeletonCard = () => (
  <div className="rounded-[26px] bg-white p-2.5">
    <div className="aspect-[4/5] animate-pulse rounded-[18px] bg-mist motion-reduce:animate-none" />
    <div className="space-y-2 px-2 pb-2 pt-4">
      <div className="h-4 w-2/3 rounded-full bg-mist" />
      <div className="h-4 w-1/3 rounded-full bg-mist" />
    </div>
  </div>
);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");

  // Category lives in the URL so /products?category=Books can be linked to.
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";

  const setCategory = (value) => {
    setSearchParams(value ? { category: value } : {}, { replace: true });
  };

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await axiosInstance.get("/products", {
          params: { search, category },
        });

        // Skip responses from older searches that arrive late.
        if (!ignore) setProducts(response.data.products);
      } catch (error) {
        console.log(error);
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    // Wait until typing pauses instead of calling the API on every key.
    const timer = setTimeout(fetchProducts, search ? 300 : 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, category]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axiosInstance.get("/customers/wishlist");
        setWishlist(response.data.wishlist || []);
      } catch (error) {
        console.log(error);
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, []);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
  };

  return (
    <Layout>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar search={search} setSearch={setSearch} />
        <CategoryFilter category={category} setCategory={setCategory} />
      </div>

      {/* Heading */}
      <div className="mb-6 mt-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[44px] font-medium leading-none tracking-[-0.04em] text-ink sm:text-[56px]">
            {category || "All products"}
            {search && (
              <span className="font-normal italic text-faint"> “{search}”</span>
            )}
          </h1>
          <p className="mt-3 text-[15px] text-muted" aria-live="polite">
            {loading
              ? "Loading…"
              : `${products.length} ${products.length === 1 ? "product" : "products"}`}
          </p>
        </div>
        {(search || category) && (
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-11 rounded-full px-4 text-[15px] text-ink underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center">
          <p className="text-2xl italic text-ink">We couldn’t load products.</p>
          <p className="mt-2 text-muted">Check your connection and try again.</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="rounded-[28px] bg-white px-6 py-20 text-center">
          <p className="text-2xl italic text-ink">Nothing matches that.</p>
          <p className="mt-2 text-muted">Try a different search or category.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 min-h-[52px] rounded-full bg-ink px-7 font-semibold text-white transition hover:bg-ink-2"
          >
            Show everything
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              wishlist={wishlist}
              onWishlistChange={(isWishlisted) => {
                setWishlist((currentWishlist) => {
                  const list = currentWishlist || [];
                  if (isWishlisted) {
                    if (list.some((item) => item._id === product._id)) return list;
                    return [...list, product];
                  }
                  return list.filter((item) => item._id !== product._id);
                });
              }}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Products;
