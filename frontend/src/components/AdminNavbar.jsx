import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

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
        px-8
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

      <div className="flex gap-8 items-center">
        <Link
          to="/admin"
          className={`font-bold transition-colors ${
            isActive("/admin") ? "text-orange-500" : "text-gray-500 hover:text-[#3a1710]"
          }`}
        >
          Menu Items
        </Link>

        <Link
          to="/orders"
          className={`font-bold transition-colors ${
            isActive("/orders") ? "text-orange-500" : "text-gray-500 hover:text-[#3a1710]"
          }`}
        >
          Live Orders
        </Link>

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
      </div>
    </motion.div>
  );
}

export default AdminNavbar;