function HeroCarousel() {
  return (
    <div
      className="
        flex
        gap-5
        overflow-x-scroll
        px-5
        py-5
      "
    >
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
        className="
          min-w-[500px]
          h-[250px]
          object-cover
          rounded-3xl
        "
      />

      <img
        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
        className="
          min-w-[500px]
          h-[250px]
          object-cover
          rounded-3xl
        "
      />

      <img
        src="https://images.unsplash.com/photo-1550547660-d9450f859349"
        className="
          min-w-[500px]
          h-[250px]
          object-cover
          rounded-3xl
        "
      />
    </div>
  );
}

export default HeroCarousel;
