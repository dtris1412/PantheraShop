import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NewCollectionSection() {
  const navigate = useNavigate();
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="New Collection"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              New Season Collection
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Discover the latest innovations in sports technology. Engineered
              for peak performance, designed for everyday athletes who demand
              excellence.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-black text-white px-8 py-4 font-semibold hover:bg-gray-800 transition-colors inline-flex items-center space-x-2"
            >
              <span>Shop Collection</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
