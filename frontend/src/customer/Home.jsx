import { useEffect, useState } from "react";

import api from "../api/axios";

import Navbar from "../components/Navbar";

import HeroCarousel from "../components/HeroCarousel";

import FoodGrid from "../components/FoodGrid";

import FloatingCart from "../components/FloatingCart";

import CheckoutModal from "../components/CheckoutModal";

import Footer from "../components/Footer";

function Home() {
  const [items, setItems] = useState([]);

  const [cart, setCart] = useState({});

  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get("/items");

      setItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const increaseQty = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decreaseQty = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  const clearCart = () => {
    setCart({});
  };

  const totalAmount = items.reduce((total, item) => {
    return total + item.price * (cart[item._id] || 0);
  }, 0);

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div
      className="
        bg-[#fffaf5]
        min-h-screen
      "
    >
      <Navbar />

      <HeroCarousel />

      <div
        id="menu-section"
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-10
          py-20
        "
      >
        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-6
            mb-14
          "
        >
          <div>
            <h1
              className="
                text-4xl
                md:text-5xl
                font-black
                text-[#4b1e14]
              "
            >
              Popular Dishes
            </h1>

            <p
              className="
                mt-3
                text-[#7a5a49]
                text-lg
              "
            >
              Freshly prepared café favourites waiting for you.
            </p>
          </div>

          <div
            className="
              bg-white
              px-6
              py-4
              rounded-2xl
              shadow-md
              flex
              items-center
              gap-4
              w-fit
            "
          >
            <div
              className="
                w-4
                h-4
                rounded-full
                bg-green-500
                animate-pulse
              "
            />

            <span
              className="
                font-semibold
                text-[#4b1e14]
              "
            >
              {items.length} items available
            </span>
          </div>
        </div>

        <FoodGrid
          items={items}
          cart={cart}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
        />
      </div>

      {totalAmount > 0 && (
        <FloatingCart
          totalAmount={totalAmount}
          totalItems={totalItems}
          onCheckout={() => setShowCheckout(true)}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          items={items}
          cart={cart}
          closeModal={() => setShowCheckout(false)}
          clearCart={clearCart}
        />
      )}

      <Footer />
    </div>
  );
}

export default Home;
