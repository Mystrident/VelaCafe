import { useEffect, useState } from "react";
import "./OfferPopup.css";

const OFFER_POPUP_SESSION_KEY = "velaa-cafe-offer-popup-seen";

function OfferPopup() {
  const [isOpen, setIsOpen] = useState(
    () => sessionStorage.getItem(OFFER_POPUP_SESSION_KEY) !== "true",
  );

  useEffect(() => {
    if (isOpen) {
      sessionStorage.setItem(OFFER_POPUP_SESSION_KEY, "true");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExploreOffers = () => {
    sessionStorage.setItem(OFFER_POPUP_SESSION_KEY, "true");
    setIsOpen(false);
    window.location.href = "/?filter=offers#menu-section";
  };

  const handleClose = () => {
    sessionStorage.setItem(OFFER_POPUP_SESSION_KEY, "true");
    setIsOpen(false);
  };

  return (
    <div className="offer-overlay" role="dialog" aria-modal="true" aria-labelledby="offer-title">
      <div className="offer-popup">
        <div className="offer-glow" aria-hidden="true" />
        <img
          className="offer-pokemon offer-pokemon-left"
          src="/images-removebg-preview.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="offer-pokemon offer-pokemon-right"
          src="/images__1_-removebg-preview.png"
          alt=""
          aria-hidden="true"
        />

        <button
          type="button"
          className="offer-close"
          onClick={handleClose}
          aria-label="Close offer"
        >
          ×
        </button>

        <div className="offer-content">
          <div className="offer-eyebrow">VELAA CAFE TRAINER</div>
          <h2 id="offer-title">
            Catch the
            <br />
            <span>tasty deals!</span>
          </h2>
          <p className="offer-description">
            New menu offers have appeared!
            <strong> Choose your favourite</strong> before they disappear.
          </p>
          <div className="offer-items" aria-hidden="true">
            <span>★</span>
            <span>Gotta snack ’em all!</span>
            <span>★</span>
          </div>
          <button type="button" className="offer-cta" onClick={handleExploreOffers}>
            View offers <span aria-hidden="true">→</span>
          </button>
          <div className="offer-note">LIMITED-TIME MENU OFFERS</div>
        </div>
      </div>
    </div>
  );
}

export default OfferPopup;
