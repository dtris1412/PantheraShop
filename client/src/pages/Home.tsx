import { ArrowRight, TrendingUp } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../contexts/productContext.tsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function Home() {
  const navigate = useNavigate();
  const { topProducts, products, sports } = useProduct();

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
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
                Premium sports gear designed for champions. Push your limits
                with cutting-edge technology.
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

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Top Rated
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Featured Products
            </h2>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="hidden md:flex items-center space-x-2 hover:underline font-medium"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Swiper wrapper with extra padding for arrows */}
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
                    rating: product.product_rating,
                    description: product.product_description,
                    sport: product.Team?.Tournament?.Sport?.sport_name, // lấy sport_name từ nested object
                  }}
                  onViewDetails={() =>
                    navigate(`/product/${product.product_id}`)
                  }
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom navigation arrows OUTSIDE swiper area */}
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

      {/* SHOP BY SPORT */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Shop by Sport</h2>
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
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW COLLECTION */}
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
    </div>
  );
}
