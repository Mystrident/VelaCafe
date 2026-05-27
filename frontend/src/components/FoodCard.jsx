function FoodCard({ item, quantity, increaseQty, decreaseQty }) {
  return (
    <div
      className="
        bg-white
        rounded-3xl
        overflow-hidden
        shadow-md
        hover:scale-105
        transition
      "
    >
      <img
        src={item.image}
        alt={item.name}
        className="
          w-full
          h-52
          object-cover
        "
      />

      <div className="p-4">
        <h2
          className="
            text-xl
            font-bold
          "
        >
          {item.name}
        </h2>

        <p
          className="
            text-orange-500
            font-semibold
            mt-2
          "
        >
          ₹{item.price}
        </p>

        <div
          className="
            flex
            items-center
            gap-4
            mt-4
          "
        >
          <button
            onClick={() => decreaseQty(item._id)}
            className="
              bg-gray-200
              px-3
              py-1
              rounded-full
            "
          >
            -
          </button>

          <span>{quantity}</span>

          <button
            onClick={() => increaseQty(item._id)}
            className="
              bg-orange-500
              text-white
              px-3
              py-1
              rounded-full
            "
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
