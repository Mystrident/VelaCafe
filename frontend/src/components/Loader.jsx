import { motion } from "framer-motion";

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex gap-3">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 bg-orange-500 rounded-full"
            animate={{
              y: ["0%", "-100%", "0%"],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.15,
            }}
          />
        ))}
      </div>
      <p className="mt-6 text-cafe-muted font-bold tracking-widest uppercase text-sm animate-pulse">
        Fetching Fresh Menu...
      </p>
    </div>
  );
}

export default Loader;
