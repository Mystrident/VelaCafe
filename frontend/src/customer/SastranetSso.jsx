import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { saveCustomerProfile } from "../utils/customerProfile";

function SastranetSso() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in through Sastranet…");

  useEffect(() => {
    const signIn = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      // Remove the sensitive SSO token from the address bar before any
      // request, redirect, or user interaction can leave it in the history.
      window.history.replaceState({}, document.title, "/sso");

      if (!token) {
        setMessage("Sastranet sign-in link is missing a token.");
        return;
      }

      try {
        const response = await api.post("/api/auth/sastranet", { token });
        localStorage.setItem("customerToken", response.data.token);
        saveCustomerProfile(response.data.user);
        window.dispatchEvent(new Event("customer-auth-changed"));
        navigate("/", { replace: true });
      } catch (error) {
        setMessage(error.response?.data?.message || "Sastranet sign in failed. Please return to Sastranet and try again.");
      }
    };

    signIn();
  }, [navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-cafe-bg px-6 text-center">
      <p className="text-cafe-text font-semibold">{message}</p>
    </main>
  );
}

export default SastranetSso;
