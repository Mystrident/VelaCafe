import { FaMinus, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import optimizeImage from "../utils/optimizeImage";

function FoodCard({ item, quantity, increaseQty, decreaseQty }) {
  const stock = item.stock || 0;
  const isOutOfStock = stock === 0;
  const showLowStockWarning = stock > 0 && stock <= 5;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="
        bg-white rounded-[2rem] overflow-hidden border border-gray-100 
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] 
        flex flex-col relative
      "
    >
      <div className="relative overflow-hidden group">
        <img
          src={optimizeImage(item.image, 500)}
          alt={item.name}
          loading="lazy"
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-xl font-bold text-[#3a1710] leading-tight pr-4">
            {item.name}
          </h2>
          <p className="text-orange-500 font-black text-xl">₹{item.price}</p>
        </div>

        {/* Dynamic Stock Warnings */}
        <div className="min-h-[24px] mb-3">
          {isOutOfStock ? (
            <span className="text-red-500 font-bold text-sm">Sold Out</span>
          ) : showLowStockWarning ? (
            <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-lg font-bold text-xs uppercase tracking-wide border border-orange-200">
              Only {stock} left!
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50">
          {isOutOfStock ? (
            <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed">
              Out of Stock
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={() => increaseQty(item._id)}
              className="w-full bg-orange-50 text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-500 hover:text-white transition-colors duration-300"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-1 rounded-2xl">
              <button
                onClick={() => decreaseQty(item._id)}
                className="w-10 h-10 rounded-xl bg-white text-[#4b1e14] shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <FaMinus className="w-3 h-3" />
              </button>

              <span className="text-lg font-bold text-[#3a1710] w-10 text-center">
                {quantity}
              </span>

              <button
                onClick={() => {
                  if (quantity < stock) increaseQty(item._id);
                }}
                disabled={quantity >= stock}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                  quantity >= stock 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                <FaPlus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default FoodCard;