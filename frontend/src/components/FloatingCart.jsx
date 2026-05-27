function FloatingCart({ totalAmount, totalItems, onCheckout }) {
  if (totalAmount <= 0) return null;

  return (
    <div
      className="
        fixed
        bottom-5
        left-1/2
        -translate-x-1/2
        bg-orange-500
        text-white
        px-6
        py-4
        rounded-full
        shadow-xl
        flex
        gap-6
        items-center
        z-50
        w-[95%]
        md:w-fit
        justify-between
      "
    >
      <div>
        <h2 className="font-bold text-lg">{totalItems} Items</h2>

        <p>₹{totalAmount}</p>
      </div>

      <button
        onClick={onCheckout}
        className="
          bg-white
          text-orange-500
          px-5
          py-2
          rounded-full
          font-bold
        "
      >
        Checkout
      </button>
    </div>
  );
}

export default FloatingCart;
