import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function HeroCarousel() {
  // IMPORTANT: Paste your Cloudinary image links back in here!
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
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-28 md:pt-32 pb-16 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
      
      {/* LEFT SIDE: Static Text (Takes full width on mobile, half on desktop) */}
      <div className="w-full md:w-1/2 space-y-5 md:space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-black text-[#3a1710] leading-[1.1] tracking-tight">
          Order Food <br />
          <span className="text-orange-500">Skip The Wait.</span>
        </h1>
        
        <p className="text-[#8b5e3c] text-base md:text-lg font-medium max-w-lg leading-relaxed">
          @Vela Cafe days turn into memories<br/>
          Pre-Order your favorites and experience the joy of
          hassle-free dining at Vela Café.
        </p>
        
        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            onClick={scrollToMenu}
            className="bg-[#3a1710] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 transition-colors shadow-lg shadow-[#3a1710]/20 active:scale-[0.98]"
          >
            Order Now
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Animated Image Slideshow - GUARANTEED VISIBLE */}
      <div className="w-full md:w-1/2 block relative h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-900/10 bg-gray-100 flex-shrink-0 mt-6 md:mt-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt="Vela Cafe Memories"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
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
      </div>
      
    </div>
  );
}

export default HeroCarousel;