import { motion } from "framer-motion";
import FoodCard from "./FoodCard";

function FoodGrid({ items, cart, increaseQty, decreaseQty }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 250, damping: 24 } 
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show" // <-- Changed from whileInView="show" to fix the invisibility bug!
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-8
      "
    >
      {items.map((item) => (
        <motion.div key={item._id} variants={itemVariants}>
          <FoodCard
            item={item}
            quantity={cart[item._id] || 0}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default FoodGrid;