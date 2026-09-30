import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axiosInstance from "../services/api";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWishlist = async () => {
    try {
      setError(false);

      const response = await axiosInstance.get(
        "/customers/wishlist",
      );

      setWishlist(response.data.wishlist || []);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();

    const interval = setInterval(() => {
      fetchWishlist();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const addToWishlist = async (productId) => {
    try {
      const response = await axiosInstance.post(
        `/customers/wishlist/${productId}`,
      );

      await fetchWishlist();

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await axiosInstance.post(
        `/customers/wishlist/${productId}`,
      );

      await fetchWishlist();

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.some(
      (item) => item._id === productId,
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};