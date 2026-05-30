import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
import FoodGrid from "../components/FoodGrid";
import FloatingCart from "../components/FloatingCart";
import CheckoutModal from "../components/CheckoutModal";
import Footer from "../components/Footer";
import StatusModal from "../components/StatusModal";
import Loader from "../components/Loader";

function Home() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isFetching, setIsFetching] = useState(true); // Initial load state

  useEffect(() => {
    fetchItems();
    const savedOrder = localStorage.getItem("activeOrder");
    if (savedOrder) {
      setActiveOrder(JSON.parse(savedOrder));
    }

    // 🔴 NEW: Listen for Live Stock Updates
    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));
    socket.on("stock-updated", ({ itemId, newStock }) => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, stock: newStock } : item
        )
      );
      
      // Auto-remove item from user's cart if new stock is lower than their cart quantity
      setCart((prevCart) => {
        if (prevCart[itemId] > newStock) {
           return { ...prevCart, [itemId]: newStock };
        }
        return prevCart;
      });
    });

    return () => socket.disconnect();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/items");
      setItems(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  // ... [KEEP increaseQty, decreaseQty, clearCart, totalAmount, totalItems logic exactly as it is] ...
  const increaseQty = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };
  const decreaseQty = (id) => {
    setCart((prev) => ({ ...prev, [id]: prev[id] > 0 ? prev[id] - 1 : 0 }));
  };
  const clearCart = () => setCart({});
  const totalAmount = items.reduce((total, item) => total + item.price * (cart[item._id] || 0), 0);
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-[#fdfbf7] min-h-screen font-sans selection:bg-orange-200 selection:text-orange-900"
    >
      <Navbar />
      <HeroCarousel />

      <div id="menu-section" className="max-w-7xl mx-auto px-4 md:px-10 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#3a1710] tracking-tight">
              Popular Dishes
            </h1>
            <p className="mt-3 text-[#8b5e3c] text-lg font-medium">
              Freshly prepared café favourites waiting for you.
            </p>
          </div>

          <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-4 w-fit">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="font-bold text-[#3a1710]">
              {items.length} items available
            </span>
          </div>
        </div>

        {/* 🔴 NEW: Show Loader or Grid */}
        {isFetching ? (
          <Loader />
        ) : (
          <FoodGrid
            items={items}
            cart={cart}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
          />
        )}
      </div>

      <FloatingCart
        totalAmount={totalAmount}
        totalItems={totalItems}
        onCheckout={() => setShowCheckout(true)}
      />

      {showCheckout && (
        <CheckoutModal
          items={items}
          cart={cart}
          closeModal={() => setShowCheckout(false)}
          clearCart={clearCart}
          onOrderPlaced={(order) => setActiveOrder(order)}
        />
      )}

      {activeOrder && (
        <StatusModal
          orderId={activeOrder.orderId}
          orderNumber={activeOrder.orderNumber}
          initialStatus={activeOrder.status}
          onClose={() => {
            localStorage.removeItem("activeOrder");
            setActiveOrder(null);
          }}
        />
      )}

      <Footer />
    </motion.div>
  );
}

export default Home;