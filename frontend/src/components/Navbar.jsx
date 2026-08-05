import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("customerToken"),
  );
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    const syncAuthenticationState = () => {
      setIsLoggedIn(!!localStorage.getItem("customerToken"));
    };

    // `storage` syncs changes made in another tab; this custom event covers
    // login/logout performed elsewhere in the current tab (such as checkout).
    window.addEventListener("storage", syncAuthenticationState);
    window.addEventListener("customer-auth-changed", syncAuthenticationState);
    return () => {
      window.removeEventListener("storage", syncAuthenticationState);
      window.removeEventListener("customer-auth-changed", syncAuthenticationState);
    };
  }, []);

  const scrollToMenu = () => {
    const section = document.getElementById("menu-section");
    section.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("activeOrders");
    setIsLoggedIn(false);
    setSignInOpen(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("customerToken", res.data.token);
      window.dispatchEvent(new Event("customer-auth-changed"));
      setIsLoggedIn(true);
      setSignInOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Google sign in failed");
    }
  };

  const signInControl = (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => alert("Google sign in failed")}
      theme="outline"
      size="medium"
    />
  );

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="/vela_cafe_logo.jpeg"
            alt="logo"
            className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-full shadow-sm"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#4b1e14] tracking-tight">VELAA</h1>
            <p className="text-[10px] md:text-xs tracking-[0.3em] text-[#8b5e3c] font-semibold">CAFÉ</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-10 font-bold text-[#4b1e14] text-sm tracking-wide">
          <button onClick={scrollToMenu} className="hover:text-orange-500 transition-colors">MENU</button>
          <button className="hover:text-orange-500 transition-colors">CONTACT</button>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-[#4b1e14] px-5 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => setSignInOpen((open) => !open)} className="bg-[#4b1e14] text-white px-5 py-2 rounded-xl hover:bg-orange-500 transition-colors shadow-sm">
                Sign In
              </button>
              {signInOpen && <div className="absolute right-0 top-12 bg-white p-3 rounded-xl shadow-lg border border-gray-100">{signInControl}</div>}
            </div>
          )}
        </div>
        <div className="md:hidden relative">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="bg-gray-100 text-[#4b1e14] px-4 py-2 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-colors">
              Sign Out
            </button>
          ) : (
            <>
              <button onClick={() => setSignInOpen((open) => !open)} className="bg-[#4b1e14] text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-500 transition-colors">
                Sign In
              </button>
              {signInOpen && <div className="absolute right-0 top-12 bg-white p-3 rounded-xl shadow-lg border border-gray-100">{signInControl}</div>}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Navbar;
