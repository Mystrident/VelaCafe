import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./customer/Home";
import SastranetSso from "./customer/SastranetSso";
import MyOrders from "./customer/MyOrders";

import Login from "./admin/Login";

import Admin from "./admin/Admin";

import Orders from "./admin/Orders";
import PreviousOrders from "./admin/PreviousOrders";

import ProtectedRoute from "./components/ProtectedRoute";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/sso" element={<SastranetSso />} />

        <Route
          path="/my-orders"
          element={
            <CustomerProtectedRoute>
              <MyOrders />
            </CustomerProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
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
          path="/previous-orders"
          element={
            <ProtectedRoute>
              <PreviousOrders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
