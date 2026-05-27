import FoodCard from "./FoodCard";

function FoodGrid({ items, cart, increaseQty, decreaseQty }) {
  return (
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-4
        gap-6
        p-6
      "
    >
      {items.map((item) => (
        <FoodCard
          key={item._id}
          item={item}
          quantity={cart[item._id] || 0}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
        />
      ))}
    </div>
  );
}

export default FoodGrid;
