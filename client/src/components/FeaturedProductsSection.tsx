import { ArrowRight, TrendingUp } from "lucide-react";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../contexts/productContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function FeaturedProductsSection() {
  const navigate = useNavigate();
  const { topProducts } = useProduct();

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Top Rated
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
        </div>
        <button
          onClick={() => navigate("/products")}
          className="hidden md:flex items-center space-x-2 hover:underline font-medium"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".custom-swiper-next",
            prevEl: ".custom-swiper-prev",
          }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          className="!pb-10"
        >
          {topProducts.slice(0, 10).map((product) => (
            <SwiperSlide key={product.product_id}>
              <ProductCard
                product={{
                  id: String(product.product_id),
                  name: product.product_name,
                  price: Number(product.product_price),
                  image: product.product_image,
                  average_rating: Number(
                    (product as any).average_rating ??
                      (product as any).averageRating ??
                      0
                  ), // SỬA ĐÚNG TRƯỜNG NÀY!
                  description: product.product_description,
                  sport: product.Team?.Tournament?.Sport?.sport_name,
                }}
                onViewDetails={() => navigate(`/product/${product.product_id}`)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Custom navigation arrows */}
        <button
          className="custom-swiper-prev absolute left-[-36px] top-1/2 -translate-y-1/2 z-20 bg-black shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-yellow-100 transition"
          tabIndex={0}
          aria-label="Previous"
          type="button"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          className="custom-swiper-next absolute right-[-36px] top-1/2 -translate-y-1/2 z-20 bg-black shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-yellow-100 transition"
          tabIndex={0}
          aria-label="Next"
          type="button"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
