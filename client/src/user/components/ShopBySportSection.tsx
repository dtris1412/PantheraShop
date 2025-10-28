import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../../shared/contexts/productContext";

export default function ShopBySportSection() {
  const navigate = useNavigate();
  const { sports } = useProduct();

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-12">Môn thể thao</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sports.map((sport) => (
          <div
            key={sport.sport_id}
            className="group relative h-96 overflow-hidden cursor-pointer"
            onClick={() => navigate(`/products?sport=${sport.sport_id}`)}
          >
            <img
              src={sport.sport_icon}
              alt={sport.sport_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-8">
              <h3 className="text-3xl font-bold text-white mb-2">
                {sport.sport_name}
              </h3>
              <div className="inline-flex items-center space-x-2 text-white font-medium group-hover:underline">
                <span>Xem thêm</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
