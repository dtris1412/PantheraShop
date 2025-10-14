import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative h-screen bg-gray-100">
      <img
        src="/assets/img/banner/banner1.png"
        alt="Hero"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-xl">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Unleash Your Athletic Potential
            </h1>
            <p className="text-xl text-white mb-8 leading-relaxed">
              Premium sports gear designed for champions. Push your limits with
              cutting-edge technology.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-white text-black px-8 py-4 font-semibold hover:bg-gray-200 transition-colors inline-flex items-center space-x-2 group"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
