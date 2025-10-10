import { ArrowRight, TrendingUp } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const featuredProducts = [
    {
      id: "1",
      name: "Air Max Performance Running Shoes",
      price: 179.99,
      discountPrice: 149.99,
      image:
        "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "Running",
      isNew: true,
      colors: 4,
    },
    {
      id: "2",
      name: "Pro Basketball Jersey",
      price: 89.99,
      image:
        "https://images.pexels.com/photos/8007412/pexels-photo-8007412.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "Basketball",
      colors: 6,
    },
    {
      id: "3",
      name: "Elite Training Shorts",
      price: 54.99,
      discountPrice: 39.99,
      image:
        "https://images.pexels.com/photos/7859406/pexels-photo-7859406.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "Training",
      colors: 3,
    },
    {
      id: "4",
      name: "Professional Football Cleats",
      price: 199.99,
      image:
        "https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "Football",
      isNew: true,
      colors: 5,
    },
  ];

  const categories = [
    {
      name: "Running",
      image:
        "https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Chase your goals",
    },
    {
      name: "Basketball",
      image:
        "https://images.pexels.com/photos/1080882/pexels-photo-1080882.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Own the court",
    },
    {
      name: "Training",
      image:
        "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Build your strength",
    },
  ];

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
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Trending
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      </section>

      {/* SHOP BY SPORT */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Shop by Sport</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="group relative h-96 overflow-hidden cursor-pointer"
              onClick={() => navigate("/products")}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-8">
                <h3 className="text-3xl font-bold text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-lg text-white mb-4">
                  {category.description}
                </p>
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
