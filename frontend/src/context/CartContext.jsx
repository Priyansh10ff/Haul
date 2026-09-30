import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axiosInstance from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCart = async () => {
    try {
      setError(false);

      const response =
        await axiosInstance.get("/cart");

      setCartItems(response.data.cart || []);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();

    const interval = setInterval(() => {
      fetchCart();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const addToCart = async (productId) => {
    try {
      const response =
        await axiosInstance.post(
          `/cart/${productId}`,
        );

      setCartItems(response.data.cart || []);

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const updateQuantity = async (
    productId,
    quantity,
  ) => {
    try {
      const response =
        await axiosInstance.patch(
          `/cart/${productId}`,
          {
            quantity,
          },
        );

      setCartItems(response.data.cart || []);

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response =
        await axiosInstance.delete(
          `/cart/${productId}`,
        );

      setCartItems(response.data.cart || []);

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const totalItems = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      item.product.price *
        item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        totalItems,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};