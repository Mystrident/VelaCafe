import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
import { saveCustomerProfile } from "../utils/customerProfile";

function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("customerToken"),
  );
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeveloperClick = () => {
    window.history.replaceState(null, "", "/#developers");
    document
      .getElementById("developers")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const syncAuthenticationState = () => {
      setIsLoggedIn(!!localStorage.getItem("customerToken"));
    };
    window.addEventListener("customer-auth-changed", syncAuthenticationState);
    return () =>
      window.removeEventListener(
        "customer-auth-changed",
        syncAuthenticationState,
      );
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("customerToken", res.data.token);
      saveCustomerProfile(res.data.user);
      window.dispatchEvent(new Event("customer-auth-changed"));
      setIsLoggedIn(true);
    } catch (error) {
      alert(error.response?.data?.message || "Google sign in failed");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!feedback.trim()) {
      setStatus("Please tell us what you think.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");
    try {
      await api.post(
        "/api/feedback",
        { feedback },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("customerToken")}`,
          },
        },
      );
      setFeedback("");
      setStatus("Thanks for sharing your feedback!");
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
          "Could not submit feedback. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      id="footer"
      className="bg-[#2a110a] text-white mt-10 rounded-t-[3rem] shadow-[0_-20px_50px_rgb(0,0,0,0.05)]"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-20 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white/90">
            VELAA CAFÉ
          </h1>
          <p className="text-lg text-white/60 leading-relaxed font-medium max-w-md">
            Fresh café food, quick pickup, and a smooth ordering experience for
            SASTRA students.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/10">
                📞
              </div>
              <p className="text-lg font-bold text-white/80">+91 89034 12927</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/10">
                📍
              </div>
              <p className="text-lg font-bold text-white/80 max-w-[250px] leading-tight">
                Inside SASTRA Deemed University, Thanjavur
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="bg-orange-500 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20 active:scale-95"
              >
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl h-[350px] md:h-[400px] border-4 border-white/5 relative group">
            <div className="absolute inset-0 bg-orange-500/10 pointer-events-none group-hover:bg-transparent transition-colors duration-500 z-10" />
            <iframe
              title="map"
              src="https://maps.google.com/maps?q=SASTRA%20Deemed%20University&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0 w-full h-full grayscale-[20%] contrast-[1.1]"
            />
          </div>
          <div
            id="feedback"
            className="rounded-[2.5rem] bg-white/10 border border-white/10 p-8 min-h-[350px] md:min-h-[400px] flex flex-col justify-center"
          >
            <p className="text-orange-300 text-sm font-black tracking-[0.2em] uppercase">
              Feedback
            </p>
            <h2 className="text-3xl font-black mt-3">How was your visit?</h2>
            {isLoggedIn ? (
              <form onSubmit={handleSubmit} className="mt-6">
                <textarea
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder="Share your experience..."
                  className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-orange-300 resize-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 rounded-2xl bg-orange-500 px-6 py-3 font-bold hover:bg-orange-400 disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send Feedback"}
                </button>
                {status && (
                  <p className="mt-3 text-sm font-semibold text-orange-200">
                    {status}
                  </p>
                )}
              </form>
            ) : (
              <div className="mt-5 space-y-3">
                <p className="text-white/60 font-medium">
                  Log in to share your feedback with us.
                </p>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert("Google sign in failed")}
                  theme="outline"
                  size="medium"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        id="developers"
        className="vela-chase-track"
        aria-label="Vela Café chase animation"
      >
        <div className="vela-nyan-stars" aria-hidden="true" />
        <p className="vela-chase-caption">
          Catch the developers : pranav & teja😂
        </p>

        <div className="vela-chase-character vela-chase-us" aria-hidden="true">
          <img src="/vela-chase-us.png" alt="" draggable="false" />
        </div>

        <button
          type="button"
          className="vela-chase-character vela-chase-cat"
          aria-label="Catch the developers"
          onClick={handleDeveloperClick}
        >
          <img src="/vela-chase-cat.gif" alt="" draggable="false" />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
