import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { HiBell, HiMenu, HiX } from "react-icons/hi";
import {
  pushNotificationsSupported,
  subscribeAdminToPushNotifications,
} from "../utils/pushNotifications";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [latestOrder, setLatestOrder] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      auth: { token },
    });
    socket.on("connect", () => socket.emit("join-admin"));
    socket.on("new-order", (order) => {
      setLatestOrder(order);
      window.dispatchEvent(new CustomEvent("admin-new-order", { detail: order }));
    });
    return () => socket.disconnect();
  }, []);

  const enableNotifications = async () => {
    try {
      await subscribeAdminToPushNotifications();
      setNotificationsEnabled(true);
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const navLinks = [
    { to: "/admin", label: "Menu Items" },
    { to: "/orders", label: "Live Orders" },
    { to: "/previous-orders", label: "Previous Orders" },
    { to: "/feedbacks", label: "Feedbacks" },
  ];

  const navigateFromMenu = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="
        bg-white/80
        backdrop-blur-lg
        border-b
        border-gray-200/50
        shadow-sm
        px-4 md:px-8
        py-4
        flex
        justify-between
        items-center
        sticky
        top-0
        z-50
      "
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black text-[#3a1710] tracking-tight">
          ADMIN <span className="text-orange-500">PORTAL</span>
        </h1>
      </div>

      <div className="hidden md:flex gap-3 md:gap-8 items-center">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`font-bold transition-colors ${
              isActive(link.to) ? "text-orange-500" : "text-gray-500 hover:text-[#3a1710]"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <button
          onClick={logout}
          className="
            bg-gray-100
            text-[#3a1710]
            font-bold
            px-6
            py-2.5
            rounded-xl
            hover:bg-red-50
            hover:text-red-600
            transition-colors
          "
        >
          Logout
        </button>
        {pushNotificationsSupported() && <button onClick={enableNotifications} title={notificationsEnabled ? "Order push notifications enabled" : "Enable order push notifications"} className="relative p-2 text-[#3a1710] hover:text-orange-500 transition-colors">
          <HiBell className="text-2xl" />
          {latestOrder && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white" />}
        </button>}
      </div>
      <button
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="md:hidden p-2 rounded-xl text-[#3a1710] hover:bg-gray-100"
      >
        {menuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
      </button>
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-white border-b border-gray-200 shadow-lg px-4 py-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.to}
                type="button"
                onClick={() => navigateFromMenu(link.to)}
                className={`text-left px-4 py-3 rounded-xl font-bold transition-colors ${
                  isActive(link.to)
                    ? "bg-orange-50 text-orange-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#3a1710]"
                }`}
              >
                {link.label}
              </button>
            ))}
            {pushNotificationsSupported() && (
              <button
                type="button"
                onClick={enableNotifications}
                className="text-left px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
              >
                {notificationsEnabled ? "Notifications Enabled" : "Enable Notifications"}
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="text-left px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
      {latestOrder && (
        <div className="fixed top-20 right-4 z-[60] max-w-sm bg-[#3a1710] text-white rounded-2xl p-4 shadow-xl">
          <p className="font-black">New order #{String(latestOrder.orderNumber).padStart(3, "0")}</p>
          <p className="text-sm text-white/80 mt-1">{latestOrder.userName} · Pickup {latestOrder.pickupTime}</p>
        </div>
      )}
    </motion.div>
  );
}

export default AdminNavbar;
