function HeroCarousel() {
  const scrollToMenu = () => {
    const section = document.getElementById("menu-section");

    section.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div
      className="
        pt-32
        md:pt-40
        bg-[#f8efe3]
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
          gap-10
          items-center
          min-h-[85vh]
        "
      >
        <div>
          <h1
            className="
              text-5xl
              md:text-7xl
              font-black
              leading-tight
              text-[#4b1e14]
            "
          >
            Order Food
            <br />
            Skip The Wait
          </h1>

          <p
            className="
              mt-6
              text-lg
              md:text-2xl
              text-[#7a5a49]
              leading-relaxed
            "
          >
            Pre-order your favourite café food and pickup instantly during rush
            hours.
          </p>

          <div
            className="
              mt-8
              flex
              flex-col
              md:flex-row
              gap-4
            "
          >
            <button
              onClick={scrollToMenu}
              className="
                bg-[#5c1f16]
                text-white
                px-8
                py-4
                rounded-2xl
                font-bold
                text-lg
                hover:scale-105
                transition
              "
            >
              Order Now
            </button>

            <button
              className="
                border-2
                border-[#5c1f16]
                text-[#5c1f16]
                px-8
                py-4
                rounded-2xl
                font-bold
              "
            >
              View Menu
            </button>
          </div>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"
            alt="food"
            className="
              rounded-[40px]
              w-full
              h-[350px]
              md:h-[650px]
              object-cover
              shadow-2xl
            "
          />
        </div>
      </div>
    </div>
  );
}

export default HeroCarousel;
