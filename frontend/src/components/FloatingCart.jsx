function FloatingCart({ totalAmount, onCheckout }) {
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
        px-8
        py-4
        rounded-full
        shadow-xl
        flex
        gap-10
        items-center
        z-50
      "
    >
      <h2>Total: ₹{totalAmount}</h2>

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
