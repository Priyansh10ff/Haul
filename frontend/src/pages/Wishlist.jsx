import { useEffect, useState } from "react";
import axiosInstance from "../services/api";
import ProductCard from "../components/ProductCard";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] py-20 text-center">
        <h2 className="text-lg text-gray-500">
          Loading wishlist...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf9f7] py-20 text-center">
        <h2 className="text-lg text-red-600">
          Something went wrong while loading your wishlist.
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#ff6b35]">
            YOUR COLLECTION
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#303030]">
            My Wishlist
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Products you saved for later.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
            <p className="text-5xl">♡</p>

            <h2 className="mt-5 text-xl font-semibold text-[#303030]">
              Your wishlist is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add products to your wishlist and they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;