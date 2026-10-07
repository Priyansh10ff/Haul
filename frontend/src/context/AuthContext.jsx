import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/customers/me")
      .then((res) => {
        setCustomer(res.data.customer);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{ customer, setCustomer, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
