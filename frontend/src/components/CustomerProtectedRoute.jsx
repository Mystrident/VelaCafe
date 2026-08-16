import { Navigate } from "react-router-dom";

function CustomerProtectedRoute({ children }) {
  return localStorage.getItem("customerToken") ? children : <Navigate to="/" replace />;
}

export default CustomerProtectedRoute;
