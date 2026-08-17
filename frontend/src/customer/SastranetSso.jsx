import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { saveCustomerProfile } from "../utils/customerProfile";

function SastranetSso() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in through sastranet…");

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
        localStorage.setItem("sastranetSession", "true");
        saveCustomerProfile(response.data.user);
        <p className="text-cafe-text font-semibold">{message}</p>;
        window.dispatchEvent(new Event("customer-auth-changed"));
        navigate("/", { replace: true });
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Sastranet sign in failed. Please return to Sastranet and try again.",
        );
      }
    };

    signIn();
  }, [navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-cafe-bg px-6 text-center">
      <div className="flex flex-col items-center">
        <img
          src="/SN_outline_vector.svg"
          alt="Sastranet"
          className="mb-5 h-20 w-20 object-contain"
        />

        <p className="text-cafe-text font-semibold">{message}</p>
      </div>
    </main>
  );
}

export default SastranetSso;
