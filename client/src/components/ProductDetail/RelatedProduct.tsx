import ProductCard from "../ProductCard";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";

export default function RelatedProduct({
  productId,
}: {
  productId: number | string;
}) {
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/products/related/${productId}`
        );
        const data = await res.json();
        setRelatedProducts(data.products || data);
      } catch {
        setRelatedProducts([]);
      }
    }
    if (productId) fetchRelated();
  }, [productId]);

  if (!relatedProducts.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-black-700">
            Các sản phẩm liên quan
          </span>
        </div>
      </div>
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".related-swiper-next",
            prevEl: ".related-swiper-prev",
          }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          className="!pb-10"
        >
          {relatedProducts.map((product) => (
            <SwiperSlide key={product.product_id}>
              <ProductCard
                product={{
                  id: String(product.product_id),
                  name: product.product_name,
                  price: Number(product.product_price),
                  image: product.product_image,
                  average_rating: Number((product as any).average_rating ?? 0),
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
          className="related-swiper-prev absolute left-[-36px] top-1/2 -translate-y-1/2 z-20 bg-black shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-yellow-100 transition"
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
          className="related-swiper-next absolute right-[-36px] top-1/2 -translate-y-1/2 z-20 bg-black shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-yellow-100 transition"
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
