import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function HeroCarousel() {
  // 🔴 PASTE YOUR CLOUDINARY URLS HERE
  const images = [
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780140896/6_oig2cq.jpg", // Replace with your 1st Cloudinary URL
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780140896/2_thtxfn.jpg", // Replace with your 2nd Cloudinary URL
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780140896/1_zs8pvu.jpg",
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780140896/5_alh8kh.jpg",
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780140895/4_etnwdg.jpg",
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780140895/3_bciv0k.jpg",
    "https://res.cloudinary.com/dxxffbmcs/image/upload/v1780140895/7_e3zugn.jpg", // Replace with your 3rd Cloudinary URL
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play the slideshow every 4 seconds
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
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-32 pb-16 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
      
      {/* LEFT SIDE: Static Text (Untouched as requested) */}
      <div className="flex-1 w-full space-y-6">
        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black text-[#3a1710] leading-[1.1] tracking-tight">
          Order Food <br />
          <span className="text-orange-500">Skip The Wait.</span>
        </h1>
        
        <p className="text-[#8b5e3c] text-lg md:text-xl font-medium max-w-lg leading-relaxed">
          Cafe which turns days into memories<br></br>
          Every bite is a celebration of flavor, crafted with love and served with a smile.<br></br>
          Pre-Order your favorites and experience the joy of hassle-free dining at Velaa Café.
        </p>
        
        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            onClick={scrollToMenu}
            className="bg-[#3a1710] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 transition-colors shadow-lg shadow-[#3a1710]/20 active:scale-[0.98]"
          >
            Order Now
          </button>
          <button 
            onClick={scrollToMenu}
            className="bg-white text-[#3a1710] border border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors active:scale-[0.98]"
          >
            View Menu
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Animated Image Slideshow */}
      <div className="flex-1 w-full relative h-[400px] md:h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-900/10 bg-gray-100">
        <AnimatePresence mode="sync">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt="Cafe atmosphere"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8, // Smooth 0.8-second fade
              ease: "easeInOut" 
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Optional: Navigation Dots at the bottom of the image */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "w-8 bg-orange-500" 
                  : "w-2.5 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default HeroCarousel;