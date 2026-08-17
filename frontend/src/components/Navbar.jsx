import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  HiClipboardList,
  HiLogout,
  HiMenu,
  HiMoon,
  HiSun,
  HiX,
} from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  clearCustomerProfile,
  getCustomerProfile,
  saveCustomerProfile,
} from "../utils/customerProfile";
import { useTheme } from "../hooks/useTheme";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("customerToken"),
  );

  const [isSastranetSession, setIsSastranetSession] = useState(
    () => localStorage.getItem("sastranetSession") === "true",
  );
  const [signInOpen, setSignInOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profile, setProfile] = useState(getCustomerProfile);

  useEffect(() => {
    const syncAuthenticationState = () => {
      setIsLoggedIn(!!localStorage.getItem("customerToken"));
      setIsSastranetSession(
        localStorage.getItem("sastranetSession") === "true",
      );
      setProfile(getCustomerProfile());
    };
    window.addEventListener("storage", syncAuthenticationState);
    window.addEventListener("customer-auth-changed", syncAuthenticationState);
    return () => {
      window.removeEventListener("storage", syncAuthenticationState);
      window.removeEventListener(
        "customer-auth-changed",
        syncAuthenticationState,
      );
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [drawerOpen]);

  const scrollTo = (id) => {
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("activeOrders");
    localStorage.removeItem("sastranetSession");

    clearCustomerProfile();
    window.dispatchEvent(new Event("customer-auth-changed"));
    setIsLoggedIn(false);
    setIsSastranetSession(false);
    setProfile(null);
    setDrawerOpen(false);
    setSignInOpen(false);
    navigate("/");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("customerToken", res.data.token);
      saveCustomerProfile(res.data.user);
      window.dispatchEvent(new Event("customer-auth-changed"));
      setIsLoggedIn(true);
      setProfile(getCustomerProfile());
      setSignInOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Google sign in failed");
    }
  };

  const initials =
    profile?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "VC";
  const signInControl = (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => alert("Google sign in failed")}
      theme="outline"
      size="medium"
    />
  );

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 w-full z-50 border-b border-cafe-border bg-cafe-surface/90 backdrop-blur-lg shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left"
          >
            <img
              src="/vela_cafe_logo.jpeg"
              alt="Velaa Cafe"
              className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-full shadow-sm"
            />
            <span>
              <span className="block text-2xl md:text-3xl font-black text-cafe-text tracking-tight">
                VELAA
              </span>
              <span className="block text-[10px] md:text-xs tracking-[0.3em] text-cafe-muted font-semibold">
                CAFÉ
              </span>
            </span>
          </button>
          <div className="flex items-center gap-4 md:gap-10 font-bold text-cafe-text text-sm tracking-wide">
            <div className="hidden md:flex items-center gap-10">
              <button
                onClick={() => scrollTo("menu-section")}
                className="hover:text-orange-500 transition-colors"
              >
                MENU
              </button>
              <button
                onClick={() => scrollTo("contact-section")}
                className="hover:text-orange-500 transition-colors"
              >
                CONTACT
              </button>
            </div>
            {isLoggedIn ? (
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open account menu"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-cafe-border bg-cafe-elevated text-cafe-text shadow-sm transition-colors hover:text-orange-500"
              >
                <HiMenu className="text-2xl" />
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setSignInOpen((open) => !open)}
                  className="bg-[#4b1e14] text-white px-4 md:px-5 py-2 rounded-xl hover:bg-orange-500 transition-colors shadow-sm"
                >
                  Sign In
                </button>
                {signInOpen && (
                  <div className="absolute right-0 top-12 bg-cafe-surface p-3 rounded-xl shadow-lg border border-cafe-border">
                    {signInControl}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              aria-label="Close account drawer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] cursor-default bg-[#2a110a]/45 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-sm flex-col border-l border-cafe-border bg-cafe-surface p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-black tracking-[0.2em] text-orange-500">
                  YOUR ACCOUNT
                </p>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close account drawer"
                  className="rounded-xl p-2 text-cafe-muted hover:bg-cafe-elevated hover:text-cafe-text"
                >
                  <HiX className="text-2xl" />
                </button>
              </div>
              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-cafe-border bg-cafe-elevated p-4">
                {profile?.picture ? (
                  <img
                    src={profile.picture}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#4b1e14] font-black text-white">
                    {initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-black text-cafe-text truncate">
                    {profile?.name || "Velaa Student"}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-cafe-muted">
                    {profile?.email || "Signed-in customer"}
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <p className="px-2 text-xs font-black tracking-[0.16em] text-cafe-muted">
                  ACCOUNT / ORDERS
                </p>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate("/my-orders");
                  }}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3.5 font-bold text-cafe-text hover:bg-cafe-elevated"
                >
                  <HiClipboardList className="text-xl text-orange-500" />
                  My Orders
                </button>
              </div>
              <div className="mt-6">
                <p className="px-2 text-xs font-black tracking-[0.16em] text-cafe-muted">
                  PREFERENCES
                </p>
                <button
                  onClick={toggleTheme}
                  className="mt-3 flex w-full items-center justify-between rounded-xl px-3 py-3.5 font-bold text-cafe-text hover:bg-cafe-elevated"
                >
                  <span className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <HiMoon className="text-xl text-orange-500" />
                    ) : (
                      <HiSun className="text-xl text-orange-500" />
                    )}
                    Dark Mode
                  </span>
                  <span
                    className={`h-6 w-11 rounded-full p-1 transition-colors ${theme === "dark" ? "bg-orange-500" : "bg-cafe-border"}`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </span>
                </button>
              </div>
              {!isSastranetSession && (
                <div className="mt-auto border-t border-cafe-border pt-6">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <HiLogout className="text-xl" />
                    Sign Out
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
