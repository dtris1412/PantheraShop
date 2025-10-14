import HeroSection from "../components/HeroSection";
import FeaturedProductsSection from "..//components/FeaturedProductsSection.tsx";
import ShopBySportSection from "../components/ShopBySportSection.tsx";
import NewCollectionSection from "../components/NewCollectionSection.tsx";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedProductsSection />
      <ShopBySportSection />
      <NewCollectionSection />
    </div>
  );
}
