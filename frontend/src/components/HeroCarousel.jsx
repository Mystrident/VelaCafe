import { motion } from "framer-motion";

function HeroCarousel() {
  const scrollToMenu = () => {
    const section = document.getElementById("menu-section");
    section.scrollIntoView({
      behavior: "smooth",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
  };

  return (
    <div
      className="
        pt-32
        md:pt-40
        pb-16
        bg-gradient-to-b from-[#fdfbf7] to-[#f8efe3]
        overflow-hidden
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          md:px-10
          grid
          md:grid-cols-2
          gap-12
          items-center
          min-h-[75vh]
        "
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="z-10"
        >
          <motion.h1
            variants={itemVariants}
            className="
              text-5xl
              md:text-7xl
              font-black
              leading-[1.1]
              text-[#3a1710]
              tracking-tight
            "
          >
            Order Food <br />
            <span className="text-orange-500">Skip The Wait.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="
              mt-6
              text-lg
              md:text-xl
              text-[#6b4e3d]
              leading-relaxed
              max-w-lg
            "
          >
            Pre-order your favourite café food and pickup instantly during rush
            hours. Fresh, fast, and exactly when you need it.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="
              mt-10
              flex
              flex-col
              sm:flex-row
              gap-4
            "
          >
            <button
              onClick={scrollToMenu}
              className="
                bg-[#4b1e14]
                text-white
                px-8
                py-4
                rounded-2xl
                font-bold
                text-lg
                shadow-lg
                shadow-[#4b1e14]/30
                hover:-translate-y-1
                hover:shadow-xl
                transition-all
                duration-300
              "
            >
              Order Now
            </button>

            <button
              onClick={scrollToMenu}
              className="
                bg-white
                border-2
                border-[#e5d5c5]
                text-[#4b1e14]
                px-8
                py-4
                rounded-2xl
                font-bold
                text-lg
                hover:border-[#4b1e14]
                hover:bg-[#fdfbf7]
                transition-all
                duration-300
              "
            >
              View Menu
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"
              alt="Delicious Cafe Food"
              className="
                rounded-[2.5rem]
                w-full
                h-[400px]
                md:h-[600px]
                object-cover
                shadow-2xl
              "
            />
          </motion.div>
          {/* Decorative blur element behind the image */}
          <div className="absolute -inset-4 bg-orange-500/20 blur-3xl -z-10 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}

export default HeroCarousel;