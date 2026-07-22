import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiCreditCard } from "react-icons/fi"; // Sleek line icons

function FloatingCart({ totalAmount, totalItems, onCheckout }) {
  return (
    <AnimatePresence>
      {totalAmount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 md:gap-4 p-2 bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl w-[95%] md:w-auto justify-between md:justify-center"
        >
          {/* Item Count Pill */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex flex-col items-center justify-center px-4 py-2 bg-gray-50/80 rounded-xl border border-gray-100/50 cursor-default shadow-sm"
          >
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
              Cart
            </span>
            <span className="font-black text-[#3a1710] flex items-center gap-2 text-sm md:text-base">
              <FiShoppingBag className="text-orange-500" /> {totalItems}
            </span>
          </motion.div>

          {/* Total Price Pill */}
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex flex-col items-center justify-center px-4 py-2 bg-gray-50/80 rounded-xl border border-gray-100/50 cursor-default shadow-sm"
          >
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
              Total
            </span>
            <span className="font-black text-[#3a1710] text-sm md:text-base">
              ₹{totalAmount}
            </span>
          </motion.div>

          {/* Checkout Action Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCheckout}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3.5 md:py-4 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors ml-auto md:ml-0"
          >
            <FiCreditCard className="hidden md:block" />
            Checkout
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingCart;