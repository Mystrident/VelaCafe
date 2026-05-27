import { FaMinus, FaPlus } from "react-icons/fa";

import optimizeImage from "../utils/optimizeImage";

function FoodCard({ item, quantity, increaseQty, decreaseQty }) {
  return (
    <div
      className="
        bg-white
        rounded-[30px]
        overflow-hidden
        shadow-md
        hover:shadow-2xl
        transition
      "
    >
      <img
        src={optimizeImage(item.image, 500)}
        alt={item.name}
        loading="lazy"
        className="
          w-full
          h-60
          object-cover
        "
      />

      <div className="p-5">
        <h2
          className="
            text-2xl
            font-bold
            text-[#4b1e14]
          "
        >
          {item.name}
        </h2>

        <p
          className="
            mt-2
            text-orange-500
            font-bold
            text-lg
          "
        >
          ₹{item.price}
        </p>

        <div
          className="
            flex
            items-center
            gap-5
            mt-5
          "
        >
          <button
            onClick={() => decreaseQty(item._id)}
            className="
              w-10
              h-10
              rounded-full
              bg-gray-100
              flex
              items-center
              justify-center
            "
          >
            <FaMinus />
          </button>

          <span
            className="
              text-xl
              font-bold
            "
          >
            {quantity}
          </span>

          <button
            onClick={() => increaseQty(item._id)}
            className="
              w-10
              h-10
              rounded-full
              bg-orange-500
              text-white
              flex
              items-center
              justify-center
            "
          >
            <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
