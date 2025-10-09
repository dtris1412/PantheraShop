import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import ProductCard from "../components/ProductCard";

interface ProductsProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Products({ onNavigate }: ProductsProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("featured");

  const products = [
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
    {
      id: "5",
      name: "Compression Training Shirt",
      price: 69.99,
      image:
        "https://images.pexels.com/photos/6740821/pexels-photo-6740821.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "Training",
      colors: 4,
    },
    {
      id: "6",
      name: "Tennis Court Shoes",
      price: 139.99,
      discountPrice: 119.99,
      image:
        "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "Tennis",
      colors: 3,
    },
    {
      id: "7",
      name: "Cycling Performance Jersey",
      price: 94.99,
      image:
        "https://images.pexels.com/photos/6837576/pexels-photo-6837576.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "Cycling",
      isNew: true,
      colors: 5,
    },
    {
      id: "8",
      name: "Marathon Running Tank",
      price: 44.99,
      image:
        "https://images.pexels.com/photos/5702814/pexels-photo-5702814.jpeg?auto=compress&cs=tinysrgb&w=800",
      category: "Running",
      colors: 4,
    },
  ];

  const categories = [
    "All",
    "Running",
    "Basketball",
    "Football",
    "Training",
    "Tennis",
    "Cycling",
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">All Products</h1>
          <p className="text-gray-600">
            Showing {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 text-sm font-medium hover:underline md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="hidden md:flex items-center space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-black"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {isFilterOpen && (
          <div className="md:hidden mb-6 p-4 bg-gray-50 border border-gray-200">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsFilterOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm ${
                    selectedCategory === category
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={(id) => onNavigate("product-details", id)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
