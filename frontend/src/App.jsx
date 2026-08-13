import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./customer/Home";
import SastranetSso from "./customer/SastranetSso";

import Login from "./admin/Login";

import Admin from "./admin/Admin";

import Orders from "./admin/Orders";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/sso" element={<SastranetSso />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
