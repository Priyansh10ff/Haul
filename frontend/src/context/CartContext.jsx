import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

// Items whose product was deleted come back with product: null.
const onlyValidItems = (items) => (items || []).filter((item) => item.product);

export const CartProvider = ({ children }) => {
  const { customer } = useAuth();
  const customerId = customer?._id;

  const [cart, setCartState] = useState([]);
  const [loading, setLoading] = useState(Boolean(customerId));
  const [error, setError] = useState("");

  const setCart = (items) => setCartState(onlyValidItems(items));

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

  // Initial load. App remounts this provider when the customer changes.
  useEffect(() => {
    if (!customerId) return;

    let cancelled = false;

    axiosInstance
      .get("/customers/cart")
      .then((response) => {
        if (!cancelled) setCartState(onlyValidItems(response.data.cart));
      })
      .catch((error) => {
        console.log(error);
        if (!cancelled) setError("Unable to load your cart.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerId]);

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
  const clearCart = () => setCartState([]);

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

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  return useContext(CartContext);
};