import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  HiClipboardList,
  HiChatAlt2,
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

const SEEN_FEEDBACK_REPLIES_KEY = "seenFeedbackReplies";

const formatFeedbackDate = (value) =>
  new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

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
  const [customerFeedback, setCustomerFeedback] = useState([]);
  const [feedbackReplyQueue, setFeedbackReplyQueue] = useState([]);

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
    let cancelled = false;

    if (!isLoggedIn) {
      setCustomerFeedback([]);
      setFeedbackReplyQueue([]);
      return undefined;
    }

    const loadCustomerFeedback = async () => {
      try {
        const response = await api.get("/api/feedback/mine", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("customerToken")}`,
          },
        });

        if (cancelled) return;

        const feedbacks = response.data;
        setCustomerFeedback(feedbacks);

        let seenReplies = {};
        try {
          seenReplies = JSON.parse(
            localStorage.getItem(SEEN_FEEDBACK_REPLIES_KEY) || "{}",
          );
        } catch {
          localStorage.removeItem(SEEN_FEEDBACK_REPLIES_KEY);
        }

        setFeedbackReplyQueue(
          feedbacks.filter(
            (entry) =>
              entry.adminReply &&
              seenReplies[entry._id] !== (entry.repliedAt || entry.createdAt),
          ),
        );
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("customerToken");
          window.dispatchEvent(new Event("customer-auth-changed"));
        }
      }
    };

    loadCustomerFeedback();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

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

  const dismissFeedbackReply = (openFeedback = false) => {
    const currentReply = feedbackReplyQueue[0];
    if (!currentReply) return;

    let seenReplies = {};
    try {
      seenReplies = JSON.parse(
        localStorage.getItem(SEEN_FEEDBACK_REPLIES_KEY) || "{}",
      );
    } catch {
      // Start fresh if a damaged local-storage value is present.
    }

    seenReplies[currentReply._id] =
      currentReply.repliedAt || currentReply.createdAt;
    localStorage.setItem(
      SEEN_FEEDBACK_REPLIES_KEY,
      JSON.stringify(seenReplies),
    );
    setFeedbackReplyQueue((current) => current.slice(1));

    if (openFeedback) {
      setDrawerOpen(false);
      navigate("/my-feedback");
    }
  };

  const repliedFeedbacks = customerFeedback.filter((entry) => entry.adminReply);

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
          <div className="flex items-center gap-3">
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
            <button
              type="button"
              onClick={() => scrollTo("developers")}
              className="vela-header-cat"
              aria-label="Catch the developers"
            >
              <img src="/velaclickme.gif" alt="" />
              <span>click me</span>
            </button>
          </div>
          <div className="flex items-center gap-4 md:gap-10 font-bold text-cafe-text text-sm tracking-wide">
            <div className="hidden md:flex items-center gap-10">
              <button
                onClick={() => scrollTo("menu-section")}
                className="hover:text-orange-500 transition-colors"
              >
                MENU
              </button>
              <button
                onClick={() => scrollTo("footer")}
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
              className="fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-sm flex-col overflow-y-auto border-l border-cafe-border bg-cafe-surface p-6 shadow-2xl"
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
                  ACCOUNT
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
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate("/my-feedback");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 font-bold text-cafe-text hover:bg-cafe-elevated"
                >
                  <HiChatAlt2 className="text-xl text-orange-500" />
                  My Feedback
                </button>
              </div>
              <div className="mt-6">
                <p className="px-2 text-xs font-black tracking-[0.16em] text-cafe-muted">
                  CAFE REPLIES
                </p>
                {repliedFeedbacks.length === 0 ? (
                  <p className="mt-3 px-2 text-sm font-medium leading-relaxed text-cafe-muted">
                    Replies to your feedback will appear here.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {repliedFeedbacks.map((entry) => (
                      <button
                        key={entry._id}
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          navigate("/my-feedback");
                        }}
                        className="w-full rounded-2xl border border-orange-100 bg-orange-50 p-4 text-left transition-colors hover:border-orange-300 dark:border-orange-900/40 dark:bg-orange-950/30"
                      >
                        <p className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-300">
                          Velaa Cafe replied
                        </p>
                        <p className="mt-2 line-clamp-3 text-sm font-medium leading-relaxed text-cafe-text">
                          {entry.adminReply}
                        </p>
                        {entry.repliedAt && (
                          <p className="mt-2 text-xs font-semibold text-orange-500/70 dark:text-orange-300/70">
                            {formatFeedbackDate(entry.repliedAt)}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
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

      <AnimatePresence>
        {feedbackReplyQueue[0] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2a110a]/55 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className="w-full max-w-md rounded-[2rem] border border-orange-100 bg-cafe-surface p-6 shadow-2xl md:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                    New reply
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-cafe-text">
                    Velaa Cafe replied to you
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => dismissFeedbackReply()}
                  aria-label="Close feedback reply"
                  className="rounded-xl p-2 text-cafe-muted hover:bg-cafe-elevated hover:text-cafe-text"
                >
                  <HiX className="text-2xl" />
                </button>
              </div>
              <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/30">
                <p className="text-sm font-medium leading-relaxed text-cafe-text">
                  {feedbackReplyQueue[0].adminReply}
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => dismissFeedbackReply()}
                  className="rounded-xl border border-cafe-border px-4 py-3 text-sm font-bold text-cafe-text hover:bg-cafe-elevated"
                >
                  Got it
                </button>
                <button
                  type="button"
                  onClick={() => dismissFeedbackReply(true)}
                  className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  View my feedback
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
