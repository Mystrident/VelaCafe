import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// React Bits style: Modular Text Animation Component
const SplitText = ({ text, delay = 0, className = "" }) => {
  const words = text.split(" ");
  
  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for that premium snap
              delay: delay + i * 0.1,
            }}
            className="inline-block origin-bottom"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

function HeroCarousel() {
  const images = [
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780155195/14_c3w7ml.jpg",
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780155194/13_l3psqu.jpg",
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780155193/9_ljs2dz.jpg",
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780155193/12_tieco3.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const scrollToMenu = () => {
    const section = document.getElementById("menu-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-28 md:pt-32 pb-16 flex flex-col md:flex-row items-center gap-12 lg:gap-20 relative">
      
      {/* Decorative Background Blob (Light Theme Enhancement) */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

      {/* LEFT SIDE: Animated Text */}
      <div className="w-full md:w-1/2 space-y-5 md:space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-black text-[#3a1710] leading-[1.1] tracking-tight">
          <SplitText text="Order Food," delay={0.1} />
          <br />
          <SplitText text="Skip The Wait." delay={0.3} className="text-orange-500" />
        </h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-[#8b5e3c] text-base md:text-lg font-medium max-w-lg leading-relaxed"
        >
          @Velaa Cafe, days turn into memories...<br />
          Pre-Order your favorites and experience the joy of hassle-free dining.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-wrap gap-4 pt-4"
        >
          <button
            onClick={scrollToMenu}
            className="group relative overflow-hidden bg-[#3a1710] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#3a1710]/20 active:scale-[0.98] transition-all"
          >
            {/* Cool hover fill effect */}
            <span className="absolute inset-0 w-full h-full bg-orange-500 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            <span className="relative z-10">Order Now</span>
          </button>
        </motion.div>
      </div>

      {/* RIGHT SIDE: Smooth Image Slideshow */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full md:w-1/2 block relative h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgb(249,115,22,0.15)] bg-gray-100 flex-shrink-0 mt-6 md:mt-0 group"
      >
        <AnimatePresence mode="sync">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt="Vela Cafe Memories"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2, // Smoother, slower crossfade
              ease: "easeInOut",
            }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        </AnimatePresence>

        {/* Floating Navigation Dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10 backdrop-blur-sm bg-white/20 w-max mx-auto px-4 py-2 rounded-full border border-white/30">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 shadow-sm ${
                index === currentIndex
                  ? "w-8 bg-orange-500"
                  : "w-2.5 bg-white/80 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default HeroCarousel;