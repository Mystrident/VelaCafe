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
  const [activeOrders, setActiveOrders] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // Search and Multi-Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]); 

// Replace your existing availableFilters array
  const availableFilters = [
    "Available Only", 
    "Beverages", 
    "Puffs", 
    "Rolls", 
    "Vadai", 
    "Bajjis", 
    "Pizza & Burgers", 
    "Chips & Cutlets", 
    "Bakery & Desserts", 
    "Paneer", 
    "Healthy & Groceries",
    "Traditional Snacks"
  ];

  // Replace your existing categoryIcons object
  const categoryIcons = {
    "Beverages": "🍹",
    "Puffs": "🥐",
    "Rolls": "🌯",
    "Vadai": "🧆",
    "Bajjis": "🥟",
    "Pizza & Burgers": "🍕",
    "Chips & Cutlets": "🍟",
    "Bakery & Desserts": "🍰",
    "Paneer": "🧀",
    "Healthy & Groceries": "🥗",
    "Traditional Snacks": "🥮",
    "Uncategorized": "🍽️"
  };
  
  useEffect(() => {
    fetchItems();
    
    const customerToken = localStorage.getItem("customerToken");

    if (!customerToken) {
      localStorage.removeItem("activeOrders");
      localStorage.removeItem("activeOrder");
    } else {
      const savedOrders = localStorage.getItem("activeOrders");
      if (savedOrders) {
        setActiveOrders(JSON.parse(savedOrders));
      } else {
        // Migrate anyone still holding the old single-order key so they
        // don't lose track of an order already in progress.
        const legacySavedOrder = localStorage.getItem("activeOrder");
        if (legacySavedOrder) {
          const migrated = [JSON.parse(legacySavedOrder)];
          localStorage.setItem("activeOrders", JSON.stringify(migrated));
          localStorage.removeItem("activeOrder");
          setActiveOrders(migrated);
        }
      }
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

  // A customer can have several orders in flight at once (e.g. one already
  // on its way, then they order again) — every one of them should keep
  // showing a tracker until the admin marks it "Completed".
  const addActiveOrder = (order) => {
    setActiveOrders((prev) => {
      const next = [...prev, order];
      localStorage.setItem("activeOrders", JSON.stringify(next));
      return next;
    });
  };

  const updateActiveOrderStatus = (orderId, status) => {
    setActiveOrders((prev) => {
      const next = prev.map((o) => (o.orderId === orderId ? { ...o, status } : o));
      localStorage.setItem("activeOrders", JSON.stringify(next));
      return next;
    });
  };

  const removeActiveOrder = (orderId) => {
    setActiveOrders((prev) => {
      const next = prev.filter((o) => o.orderId !== orderId);
      localStorage.setItem("activeOrders", JSON.stringify(next));
      return next;
    });
  };
  
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

    // Filter: Available Only
    if (activeFilters.includes("Available Only") && item.stock === 0) {
      matchesFilter = false;
    }

    // Filter: Specific Categories (If category filters are selected, it must match one)
    const categoryFilters = activeFilters.filter(f => f !== "Available Only");
    const itemCategory = item.category || "Uncategorized"; // Safely grab category from DB
    
    if (categoryFilters.length > 0 && !categoryFilters.includes(itemCategory)) {
      matchesFilter = false;
    }

    return matchesSearch && matchesFilter;
  });

  // 2. Group the remaining items by database category for rendering
  const groupedItems = filteredItems.reduce((acc, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-cafe-bg min-h-screen font-sans text-cafe-text selection:bg-orange-200 selection:text-orange-900"
    >
      <Navbar />
      <HeroCarousel />

      <div id="menu-section" className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-20">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-cafe-text tracking-tight">
              Our Menu
            </h1>
            <p className="mt-3 text-cafe-muted text-lg font-medium">
              Freshly prepared café favourites waiting for you.
            </p>
          </div>
        </div>

        {/* Search & Scrollable Filter Chips */}
        <div className="mb-12 sticky top-20 z-40 bg-cafe-bg/90 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
          
          {/* Search Bar */}
          <div className="relative flex items-center bg-cafe-surface border border-cafe-border rounded-[1.25rem] px-4 py-3.5 shadow-sm focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all mb-4">
            <HiSearch className="text-cafe-muted text-xl shrink-0" />
            <input 
              type="text" 
              placeholder="Search dishes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none ml-3 text-cafe-text font-bold placeholder:text-cafe-muted placeholder:font-medium text-sm md:text-base"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-300 hover:text-gray-500 font-bold ml-2">✕</button>
            )}
          </div>

          {/* Scrollable Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-cafe-elevated rounded-xl text-cafe-muted shrink-0">
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
                      : "bg-cafe-surface text-cafe-muted border-cafe-border hover:bg-cafe-elevated"
                    }
                  `}
                >
                  {filter} {isActive && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categorized Rendering */}
        {isFetching ? (
          <Loader />
        ) : filteredItems.length > 0 ? (
          <div className="space-y-16">
            {/* Map over the keys of groupedItems directly to handle any dynamic categories */}
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
                  <h2 className="text-2xl md:text-3xl font-black text-cafe-text mb-6 flex items-center gap-3">
                    <span className="text-3xl">{categoryIcons[category]}</span>
                    {category}
                    <span className="text-sm font-bold text-cafe-muted bg-cafe-elevated px-3 py-1 rounded-lg ml-2">
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
            <h3 className="text-2xl font-black text-cafe-text">No dishes found</h3>
            <p className="text-cafe-muted font-medium mt-2">Try removing some filters or adjusting your search.</p>
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
        <CheckoutModal items={items} cart={cart} closeModal={() => setShowCheckout(false)} clearCart={clearCart} onOrderPlaced={(order) => addActiveOrder(order)} />
      )}

      {activeOrders.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-4">
          {activeOrders.map((order) => (
            <StatusModal
              key={order.orderId}
              orderId={order.orderId}
              orderNumber={order.orderNumber}
              initialStatus={order.status}
              onStatusChange={(status) => updateActiveOrderStatus(order.orderId, status)}
              onClose={() => removeActiveOrder(order.orderId)}
            />
          ))}
        </div>
      )}

      <Footer />
    </motion.div>
  );
}

export default Home;
