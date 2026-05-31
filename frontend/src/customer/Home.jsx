import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { HiSearch, HiOutlineAdjustments } from "react-icons/hi"; 
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
  const [isFetching, setIsFetching] = useState(true);

  // Search and Multi-Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]); // Array to hold multiple active filters

  // 🔴 SMART CATEGORIZATION: Auto-groups items based on their names
  const getCategory = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("puff")) return "Puffs";
    if (lower.includes("roll")) return "Rolls";
    if (lower.includes("cake") || lower.includes("brownie") || lower.includes("sweet")) return "Desserts";
    return "Beverages & Others"; // Fallback for Dosa, Coffee, etc.
  };

  const availableFilters = ["Available Only", "Puffs", "Rolls", "Desserts", "Beverages & Others"];

  useEffect(() => {
    fetchItems();
    
    const savedOrder = localStorage.getItem("activeOrder");
    const customerToken = localStorage.getItem("customerToken");

    if (savedOrder && customerToken) {
      setActiveOrder(JSON.parse(savedOrder));
    } else if (!customerToken && savedOrder) {
      localStorage.removeItem("activeOrder");
      setActiveOrder(null);
    }

    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));
    socket.on("stock-updated", ({ itemId, newStock }) => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, stock: newStock } : item
        )
      );
      
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

  const increaseQty = (id) => setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const decreaseQty = (id) => setCart((prev) => ({ ...prev, [id]: prev[id] > 0 ? prev[id] - 1 : 0 }));
  const clearCart = () => setCart({});
  
  const totalAmount = items.reduce((total, item) => total + item.price * (cart[item._id] || 0), 0);
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  // Toggle multiple filters
  const toggleFilter = (filter) => {
    setActiveFilters((prev) => 
      prev.includes(filter) 
        ? prev.filter((f) => f !== filter) 
        : [...prev, filter]
    );
  };

  // 1. Apply Search and Filters
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    const itemCategory = getCategory(item.name);

    // Filter: Available Only
    if (activeFilters.includes("Available Only") && item.stock === 0) {
      matchesFilter = false;
    }

    // Filter: Specific Categories (If category filters are selected, it must match one)
    const categoryFilters = activeFilters.filter(f => f !== "Available Only");
    if (categoryFilters.length > 0 && !categoryFilters.includes(itemCategory)) {
      matchesFilter = false;
    }

    return matchesSearch && matchesFilter;
  });

  // 2. Group the remaining items by category for rendering
  const groupedItems = filteredItems.reduce((acc, item) => {
    const cat = getCategory(item.name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Icons for categories
  const categoryIcons = {
    "Puffs": "🥐",
    "Rolls": "🌯",
    "Desserts": "🍰",
    "Beverages & Others": "☕"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-[#fdfbf7] min-h-screen font-sans selection:bg-orange-200 selection:text-orange-900"
    >
      <Navbar />
      <HeroCarousel />

      <div id="menu-section" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#3a1710] tracking-tight">
              Our Menu
            </h1>
            <p className="mt-3 text-[#8b5e3c] text-lg font-medium">
              Freshly prepared café favourites waiting for you.
            </p>
          </div>
        </div>

        {/* 🔴 NEW: Search & Scrollable Filter Chips */}
        <div className="mb-12 sticky top-20 z-40 bg-[#fdfbf7]/90 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
          
          {/* Search Bar */}
          <div className="relative flex items-center bg-white border border-gray-100 rounded-[1.25rem] px-4 py-3.5 shadow-sm focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all mb-4">
            <HiSearch className="text-gray-400 text-xl shrink-0" />
            <input 
              type="text" 
              placeholder="Search dishes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none ml-3 text-[#3a1710] font-bold placeholder:text-gray-400 placeholder:font-medium text-sm md:text-base"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-300 hover:text-gray-500 font-bold ml-2">✕</button>
            )}
          </div>

          {/* Scrollable Filter Chips (Zomato/Swiggy Style) */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-gray-500 shrink-0">
              <HiOutlineAdjustments className="text-lg" />
              <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
            </div>
            
            {availableFilters.map((filter) => {
              const isActive = activeFilters.includes(filter);
              return (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border
                    ${isActive 
                      ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20" 
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }
                  `}
                >
                  {filter} {isActive && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🔴 NEW: Categorized Rendering */}
        {isFetching ? (
          <Loader />
        ) : filteredItems.length > 0 ? (
          <div className="space-y-16">
            {Object.keys(categoryIcons).map((category) => {
              const itemsInCategory = groupedItems[category];
              
              // Only render the section if there are items in it
              if (!itemsInCategory || itemsInCategory.length === 0) return null;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={category}
                >
                  {/* Category Header */}
                  <h2 className="text-2xl md:text-3xl font-black text-[#3a1710] mb-6 flex items-center gap-3">
                    <span className="text-3xl">{categoryIcons[category]}</span>
                    {category}
                    <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg ml-2">
                      {itemsInCategory.length}
                    </span>
                  </h2>
                  
                  {/* Grid for this specific category */}
                  <FoodGrid
                    items={itemsInCategory}
                    cart={cart}
                    increaseQty={increaseQty}
                    decreaseQty={decreaseQty}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-black text-[#3a1710]">No dishes found</h3>
            <p className="text-gray-500 font-medium mt-2">Try removing some filters or adjusting your search.</p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveFilters([]); }}
              className="mt-6 bg-orange-50 text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-100 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <FloatingCart totalAmount={totalAmount} totalItems={totalItems} onCheckout={() => setShowCheckout(true)} />

      {showCheckout && (
        <CheckoutModal items={items} cart={cart} closeModal={() => setShowCheckout(false)} clearCart={clearCart} onOrderPlaced={(order) => setActiveOrder(order)} />
      )}

      {activeOrder && (
        <StatusModal orderId={activeOrder.orderId} orderNumber={activeOrder.orderNumber} initialStatus={activeOrder.status} onClose={() => { localStorage.removeItem("activeOrder"); setActiveOrder(null); }} />
      )}

      <Footer />
    </motion.div>
  );
}

export default Home;