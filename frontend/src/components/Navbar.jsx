import { HiMenu } from "react-icons/hi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if customer is logged in on load
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("customerToken"));
  }, []);

  const scrollToMenu = () => {
    const section = document.getElementById("menu-section");
    section.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    // Completely wipe the customer's session
    localStorage.removeItem("customerToken");
    localStorage.removeItem("activeOrder");
    setIsLoggedIn(false);
    window.location.reload(); // Refresh to clean state
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="
        fixed
        top-0
        left-0
        w-full
        z-50
        bg-white/80
        backdrop-blur-lg
        border-b
        border-gray-200/50
        shadow-sm
      "
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="/vela_cafe_logo.jpeg"
            alt="logo"
            className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-full shadow-sm"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#4b1e14] tracking-tight">
              VELAA
            </h1>
            <p className="text-[10px] md:text-xs tracking-[0.3em] text-[#8b5e3c] font-semibold">
              CAFÉ
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10 font-bold text-[#4b1e14] text-sm tracking-wide">
          <button onClick={scrollToMenu} className="hover:text-orange-500 transition-colors">
            MENU
          </button>
          
          <button
            onClick={() => {
              const section = document.getElementById("contact-section");
              section.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-orange-500 transition-colors"
          >
            CONTACT
          </button>

          {/* 🔴 NEW: Conditional Sign Out Button */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-[#4b1e14] px-5 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
            >
              Sign Out
            </button>
          )}
        </div>

        <button className="md:hidden text-3xl text-[#4b1e14] hover:text-orange-500 transition-colors">
          <HiMenu />
        </button>
      </div>
    </motion.div>
  );
}

export default Navbar;