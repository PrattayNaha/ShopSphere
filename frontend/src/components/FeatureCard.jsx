import React from "react";
import codIcon from "../image/cod.png";          // Cash on Delivery icon
import returnIcon from "../image/return.png";    // Instant Return icon
import deliveryIcon from "../image/delivery.png"; // Delivery icon
import dealIcon from "../image/deal.jpg";        // Best Price Deal icon
import "../styles/featureCards.css";

const features = [
  { icon: codIcon, title: "Cash On Delivery" },
  { icon: returnIcon, title: "Instant Return" },
  { icon: deliveryIcon, title: "Delivery Within 48hrs", highlight: "48hrs" },
  { icon: dealIcon, title: "Best Price Deal" },
];

const FeatureCards = () => {
  return (
    <section className="feature-cards">
      {features.map((f, idx) => (
        <div className="feature-card" key={idx}>
          <img src={f.icon} alt={f.title} />
          <span>
            {f.title.split(" ").map((word, i) =>
              word === f.highlight ? <strong key={i}>{word}</strong> : word + " "
            )}
          </span>
        </div>
      ))}
    </section>
  );
};

export default FeatureCards;
