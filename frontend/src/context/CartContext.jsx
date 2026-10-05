import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/customers/cart");

      setCart(
        response.data.cart ||
          response.data.customer?.cart ||
          []
      );
    } catch (error) {
      console.log(error);
      setError("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    try {
      const response = await axiosInstance.post(
        `/customers/cart/${productId}`
      );

      const updatedCart =
        response.data.cart ||
        response.data.customer?.cart;

      if (updatedCart) {
        setCart(updatedCart);
      } else {
        await fetchCart();
      }

      return {
        success: true,
        message: response.data.message || "Added to cart",
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to add product to cart",
      };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await axiosInstance.patch(
        `/customers/cart/${productId}`,
        {
          quantity,
        }
      );

      const updatedCart =
        response.data.cart ||
        response.data.customer?.cart;

      if (updatedCart) {
        setCart(updatedCart);
      } else {
        await fetchCart();
      }

      return {
        success: true,
        message: response.data.message || "Cart updated",
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to update cart",
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axiosInstance.delete(
        `/customers/cart/${productId}`
      );

      const updatedCart =
        response.data.cart ||
        response.data.customer?.cart;

      if (updatedCart) {
        setCart(updatedCart);
      } else {
        await fetchCart();
      }

      return {
        success: true,
        message: response.data.message || "Removed from cart",
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to remove product",
      };
    }
  };

  // Called after the backend has verified payment and emptied its own cart.
  const clearCart = () => setCart([]);

  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;

      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};