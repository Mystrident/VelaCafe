import { FaShoppingCart } from "react-icons/fa";

function Navbar() {
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
        VELA CAFE
      </h1>

      <FaShoppingCart
        className="
          text-2xl
          text-orange-500
        "
      />
    </div>
  );
}

export default Navbar;
