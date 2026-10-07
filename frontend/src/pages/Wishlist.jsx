import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/api";
import ProductCard from "../components/ProductCard";
import Layout from "../components/Layout";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axiosInstance.get("/customers/wishlist");

        setWishlist(response.data.wishlist);
        setError(false);
      } catch (error) {
        console.log(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();

    window.addEventListener("focus", fetchWishlist);

    return () => window.removeEventListener("focus", fetchWishlist);
  }, []);

  let content;

  if (loading) {
    content = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-[26px] bg-white motion-reduce:animate-none" />
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center">
        <p className="text-2xl italic text-ink">We couldn’t load your saved items.</p>
      </div>
    );
  } else if (wishlist.length === 0) {
    content = (
      <div className="rounded-[28px] bg-white px-6 py-20 text-center">
        <p className="text-[28px] italic text-ink">Nothing saved yet.</p>
        <p className="mt-2 text-muted">Tap the heart on any product to keep it here.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-ink px-7 font-semibold text-white hover:bg-ink-2"
        >
          Browse products
        </Link>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            wishlist={wishlist}
            onWishlistChange={(isWishlisted) => {
              if (!isWishlisted) {
                setWishlist((currentWishlist) =>
                  currentWishlist.filter((item) => item._id !== product._id),
                );
              }
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <Layout>
      <div className="pb-8 pt-6">
        <h1 className="text-[48px] font-semibold leading-none tracking-[-0.05em] text-ink sm:text-[72px]">
          Saved
          {!loading && wishlist.length > 0 && (
            <span className="font-normal italic text-faint"> ({wishlist.length})</span>
          )}
        </h1>
        <p className="mt-3 text-[15px] text-muted">Products you’re keeping an eye on.</p>
      </div>
      {content}
    </Layout>
  );
};

export default Wishlist;
