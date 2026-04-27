import React, { useEffect, useState } from "react";
import electronics from "../image/electronics.png";
import newArrival from "../image/new_arrival.png";
import summerSale from "../image/summersale.png";
import "../styles/hero.css";

const slides = [electronics, newArrival, summerSale];

const HeroSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % slides.length),
      5000 // 5 seconds per slide
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero">
      <img
        src={slides[index]}
        alt={`Slide ${index + 1}`}
        className="hero-image"
      />
    </section>
  );
};

export default HeroSlider;
