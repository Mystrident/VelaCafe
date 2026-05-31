import { motion } from "framer-motion";

function FoodGrid({ items, cart, increaseQty, decreaseQty }) {
  if (!items || items.length === 0) return null;

  return (
    // 🔴 THE FIX: 'grid-cols-1' for ultra-small screens, 'min-[375px]:grid-cols-2' for standard phones
    <div className="grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => {
        const quantity = cart[item._id] || 0;
        const isOutOfStock = item.stock === 0;

        return (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={item._id}
            className={`bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col transition-all ${
              isOutOfStock ? "opacity-60 grayscale-[0.3]" : "hover:shadow-md"
            }`}
          >
            {/* Image Section - Taller (h-40) for 1-column, compact (h-28) for 2-column */}
            <div className="relative h-40 min-[375px]:h-28 sm:h-36 md:h-48 w-full bg-gray-50 overflow-hidden">
              {item.image ? (
                <img
                  src={
                    item.image.startsWith("http")
                      ? item.image
                      : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/${item.image}`
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 bg-[#2a110a]/40 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-white text-red-500 font-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs tracking-wider uppercase shadow-lg">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-4 min-[375px]:p-3 md:p-5 flex flex-col flex-grow">
              
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="text-base min-[375px]:text-sm md:text-lg font-black text-[#3a1710] leading-tight line-clamp-2">
                  {item.name}
                </h3>
                <span className="text-orange-500 font-black text-base min-[375px]:text-sm md:text-lg shrink-0">
                  ₹{item.price}
                </span>
              </div>

              {item.stock > 0 && item.stock <= 5 && (
                <div className="mb-3">
                  <span className="text-[10px] min-[375px]:text-[9px] md:text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 uppercase tracking-wider">
                    ONLY {item.stock} LEFT!
                  </span>
                </div>
              )}

              <div className="mt-auto pt-3 min-[375px]:pt-2 md:pt-4">
                {quantity === 0 ? (
                  <button
                    onClick={() => increaseQty(item._id)}
                    disabled={isOutOfStock}
                    className="w-full bg-orange-50 text-orange-600 font-bold py-3 min-[375px]:py-2 md:py-3 rounded-xl text-sm min-[375px]:text-xs md:text-sm hover:bg-orange-100 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-100 border border-orange-100 active:scale-[0.98]"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-orange-500 text-white rounded-xl overflow-hidden h-10 min-[375px]:h-8 md:h-11 shadow-md shadow-orange-500/20">
                    <button
                      onClick={() => decreaseQty(item._id)}
                      className="w-1/3 h-full flex items-center justify-center font-black text-lg min-[375px]:text-sm md:text-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-black text-sm min-[375px]:text-xs md:text-sm">{quantity}</span>
                    <button
                      onClick={() => increaseQty(item._id)}
                      disabled={quantity >= item.stock}
                      className="w-1/3 h-full flex items-center justify-center font-black text-lg min-[375px]:text-sm md:text-lg hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-50 disabled:hover:bg-orange-500"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default FoodGrid;