import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import PageTransition from "./components/PageTransition";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Keyed by the logged-in customer so the cart reloads on login and is
// wiped on logout instead of showing the previous user's data.
const CustomerCart = ({ children }) => {
  const { customer } = useAuth();

  return (
    <CartProvider key={customer?._id || "guest"}>{children}</CartProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CustomerCart>
      <BrowserRouter>
        <PageTransition>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/home" replace />}
            />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order-success/:id"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
      </CustomerCart>
    </AuthProvider>
  );
};

export default App;