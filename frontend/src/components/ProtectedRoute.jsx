import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import FullPageLoader from "./FullPageLoader";

const ProtectedRoute = ({ children }) => {
  const { customer, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!customer) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
