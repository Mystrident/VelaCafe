import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./customer/Home";
import SastranetSso from "./customer/SastranetSso";
import MyOrders from "./customer/MyOrders";
import MyFeedback from "./customer/MyFeedback";

import Login from "./admin/Login";

import Admin from "./admin/Admin";

import Orders from "./admin/Orders";
import PreviousOrders from "./admin/PreviousOrders";
import Feedbacks from "./admin/Feedbacks";

import ProtectedRoute from "./components/ProtectedRoute";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute";
// import OfferPopup from "./components/OfferPopup";

function App() {
  return (
    <BrowserRouter>
      {/* <OfferPopup /> */}
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

        <Route
          path="/my-feedback"
          element={
            <CustomerProtectedRoute>
              <MyFeedback />
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

        <Route
          path="/feedbacks"
          element={
            <ProtectedRoute>
              <Feedbacks />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
