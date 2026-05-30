import { motion, AnimatePresence } from "framer-motion";

function FloatingCart({ totalAmount, totalItems, onCheckout }) {
  return (
    <AnimatePresence>
      {totalAmount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="
            fixed
            bottom-6
            left-1/2
            bg-[#2a110a]
            text-white
            p-3
            pr-4
            pl-6
            rounded-full
            shadow-2xl
            shadow-black/20
            flex
            gap-8
            items-center
            z-50
            w-[90%]
            md:w-auto
            justify-between
            border
            border-white/10
          "
        >
          <div className="flex flex-col">
            <span className="text-xs text-gray-300 font-medium uppercase tracking-wider">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
            </span>
            <span className="font-bold text-xl text-white">
              ₹{totalAmount}
            </span>
          </div>

          <button
            onClick={onCheckout}
            className="
              bg-orange-500
              hover:bg-orange-400
              text-white
              px-8
              py-3
              rounded-full
              font-bold
              transition-all
              active:scale-95
              shadow-lg
              shadow-orange-500/30
            "
          >
            Checkout
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingCart;