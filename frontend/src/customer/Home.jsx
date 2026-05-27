import { useEffect, useState } from "react";

import api from "../api/axios";

import Navbar from "../components/Navbar";

import HeroCarousel from "../components/HeroCarousel";

import FoodGrid from "../components/FoodGrid";

import FloatingCart from "../components/FloatingCart";

import CheckoutModal from "../components/CheckoutModal";

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

  return (
    <div className="pb-40">
      <Navbar />

      <HeroCarousel />

      <FoodGrid
        items={items}
        cart={cart}
        increaseQty={increaseQty}
        decreaseQty={decreaseQty}
      />

      <FloatingCart
        totalAmount={totalAmount}
        onCheckout={() => setShowCheckout(true)}
      />

      {showCheckout && (
        <CheckoutModal
          items={items}
          cart={cart}
          totalAmount={totalAmount}
          closeModal={() => setShowCheckout(false)}
          clearCart={clearCart}
        />
      )}
    </div>
  );
}

export default Home;
