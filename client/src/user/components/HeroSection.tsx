import React, { useEffect, useState, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;
interface Banner {
  banner_id: number;
  title: string;
  description: string;
  image_url: string;
}

export default function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/banners`)
      .then((res) => res.json())
      .then((data) => setBanners(data));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleNext();
    }, 10000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line
  }, [banners, current]);

  if (!banners.length) return null;

  const banner = banners[current];

  const handlePrev = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
      setAnimating(false);
    }, 500);
  };

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
      setAnimating(false);
    }, 500);
  };

  const handleDot = (idx: number) => {
    if (idx === current || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 500);
  };

  return (
    <section className="relative min-h-[calc(100vh-0px)] w-full bg-gray-100 overflow-hidden select-none">
      {/* Ảnh nền với hiệu ứng fade mượt */}
      <div className="absolute inset-0 w-full h-full">
        {banners.map((b, idx) => (
          <img
            key={b.banner_id}
            src={b.image_url}
            alt={b.title}
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ease-in-out
              ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
            draggable={false}
            style={{ transitionProperty: "opacity" }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </div>
      {/* Nội dung căn xuống cuối ảnh */}
      <div className="relative z-20 flex flex-col justify-end h-full min-h-[500px] pb-10 md:pb-0">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl animate-fade-in-up pointer-events-none select-none">
            <h1 className="text-2xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg transition-all duration-700">
              {banner.title}
            </h1>
            <p className="text-base md:text-xl text-white mb-6 leading-relaxed drop-shadow transition-all duration-700">
              {banner.description}
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-white/90 text-black px-6 py-3 font-semibold hover:bg-gray-200 transition-all duration-300 inline-flex items-center space-x-2 group shadow-lg rounded-xl pointer-events-auto text-base md:text-lg"
            >
              <span>Mua ngay</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      {/* Nút chuyển banner - làm mờ hơn */}
      <button
        className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-all z-30"
        onClick={handlePrev}
        aria-label="Previous banner"
        disabled={animating}
        style={{ pointerEvents: animating ? "none" : "auto" }}
      >
        <ChevronLeft className="w-7 h-7" />
      </button>
      <button
        className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-all z-30"
        onClick={handleNext}
        aria-label="Next banner"
        disabled={animating}
        style={{ pointerEvents: animating ? "none" : "auto" }}
      >
        <ChevronRight className="w-7 h-7" />
      </button>
      {/* Thanh hiển thị ảnh hiện tại - hình trụ nằm ngang, nhỏ và mờ hơn */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex space-x-2 z-30">
        {banners.map((b, idx) => (
          <button
            key={b.banner_id}
            onClick={() => handleDot(idx)}
            className={`w-8 h-2 rounded-full transition-all duration-300 ${
              idx === current ? "bg-white/80 shadow scale-110" : "bg-white/40"
            }`}
            aria-label={`Chọn banner ${idx + 1}`}
            disabled={animating}
            style={{ pointerEvents: animating ? "none" : "auto" }}
          />
        ))}
      </div>
      {/* Animation cho nội dung */}
      <style>
        {`
          .animate-fade-in-up {
            animation: fadeInUp 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </section>
  );
}
