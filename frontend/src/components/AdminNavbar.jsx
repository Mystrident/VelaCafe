import { Link, useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <div
      className="
        bg-white
        shadow-md
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
      <h1
        className="
          text-3xl
          font-bold
          text-orange-500
        "
      >
        ADMIN PANEL
      </h1>

      <div
        className="
          flex
          gap-6
          items-center
        "
      >
        <Link
          to="/admin"
          className="
            font-semibold
            hover:text-orange-500
          "
        >
          Add Items
        </Link>

        <Link
          to="/orders"
          className="
            font-semibold
            hover:text-orange-500
          "
        >
          Orders
        </Link>

        <button
          onClick={logout}
          className="
            bg-orange-500
            text-white
            px-5
            py-2
            rounded-xl
            hover:bg-orange-600
            transition
          "
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminNavbar;
