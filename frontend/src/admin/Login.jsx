import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/admin/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/admin");
    } catch (error) {
      console.log(error);
      alert("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f4ebe1] flex justify-center items-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.05)] w-full max-w-md border border-white"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#3a1710] tracking-tight">Admin Portal</h1>
          <p className="text-[#8b5e3c] mt-2 font-medium text-sm uppercase tracking-widest">Velaa Café</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all font-medium"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all font-medium"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 bg-[#3a1710] text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 transition-colors shadow-lg shadow-[#3a1710]/20 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;