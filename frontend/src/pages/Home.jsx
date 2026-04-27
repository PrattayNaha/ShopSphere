import React, { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import HeroSlider from "../components/HeroSlider";
import CategoryGrid from "../components/CategoryGrid";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import FeatureCards from "../components/FeatureCard";
import MobileSearch from "../components/MobileSearch";
import "../styles/home.css";

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="home">
        <HeroSlider />
        <MobileSearch />
        <CategoryGrid />
        <FeatureCards />
        <section className="product-section">
          <div className="product-grid">
            <ProductCard />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
