import ProductFilterBar from "../components/ProductFilterBar";
import SearchProduct from "../components/SearchProduct";
import ProductSortBar from "../components/ProductSortBar";
import ProductGrid from "../components/ProductGrid";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProduct } from "../contexts/productContext";

export default function Products() {
  const navigate = useNavigate();
  const { products, sports } = useProduct();
  const topRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  console.log(products[0]);

  // Danh sách category cố định + động
  const fixedCategories = ["Tất cả", "Áo đấu", "Giày", "Phụ kiện", "Bóng"];
  const categories = useMemo(() => {
    const catNames = Array.from(
      new Set(
        products
          .map((p) => p.Category?.category_name)
          .filter((name): name is string => !!name)
      )
    );
    const filteredDynamicCats = catNames.filter(
      (c) => !fixedCategories.includes(c)
    );
    return [...fixedCategories, ...filteredDynamicCats];
  }, [products]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedSort, setSelectedSort] = useState("featured");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  // Lọc sản phẩm theo category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Lọc theo category, sport, tournament, team...
    filtered = filtered.filter(
      (p) =>
        (selectedCategory === "Tất cả" ||
          p.Category?.category_name === selectedCategory) &&
        (selectedSport === "" ||
          p.Team?.Tournament?.Sport?.sport_name === selectedSport) &&
        (selectedTournament === "" ||
          p.Team?.Tournament?.tournament_name === selectedTournament) &&
        (selectedTeam === "" || p.Team?.team_name === selectedTeam)
    );

    // Lọc theo tìm kiếm
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sắp xếp
    if (selectedSort === "price-low") {
      filtered = [...filtered].sort(
        (a, b) => a.product_price - b.product_price
      );
    } else if (selectedSort === "price-high") {
      filtered = [...filtered].sort(
        (a, b) => b.product_price - a.product_price
      );
    } else if (selectedSort === "newest") {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.release_date ?? 0).getTime() -
          new Date(a.release_date ?? 0).getTime()
      );
    }
    return filtered;
  }, [
    products,
    selectedCategory,
    selectedSport,
    selectedTournament,
    selectedTeam,
    searchQuery,
    selectedSort,
  ]);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Lấy sản phẩm cho trang hiện tại
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  // Khi filter/search/sort thay đổi, reset về trang 1 và scroll lên đầu grid
  useEffect(() => {
    setCurrentPage(1);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    selectedCategory,
    selectedSport,
    selectedTournament,
    selectedTeam,
    searchQuery,
    selectedSort,
  ]);

  // Scroll về đầu grid khi chuyển trang (nếu không phải do filter/search/sort)
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage]);

  useEffect(() => {
    const sportId = searchParams.get("sport");
    if (sportId && sports.length > 0) {
      // Tìm tên môn thể thao theo id
      const sport = sports.find((s) => String(s.sport_id) === String(sportId));
      if (sport) setSelectedSport(sport.sport_name);
    }
  }, [searchParams, sports]);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">All Products</h1>
          <p className="text-gray-600">
            Showing {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="flex gap-8">
          {/* Sidebar filter bên trái */}
          <aside className="w-64 hidden md:block">
            <div className="sticky top-28">
              <ProductFilterBar
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSport={selectedSport}
                setSelectedSport={setSelectedSport}
                selectedTournament={selectedTournament}
                setSelectedTournament={setSelectedTournament}
                selectedTeam={selectedTeam}
                setSelectedTeam={setSelectedTeam}
              />
            </div>
          </aside>
          {/* Grid sản phẩm bên phải */}
          <main className="flex-1">
            <div ref={topRef} />
            {/* Thanh tìm kiếm và sort bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex-1">
                <SearchProduct
                  products={filteredProducts}
                  onSelect={(product) =>
                    navigate(`/product/${product.product_id}`)
                  }
                  setQuery={setSearchQuery}
                />
              </div>
              <div>
                <ProductSortBar
                  selectedSort={selectedSort}
                  setSelectedSort={setSelectedSort}
                />
              </div>
            </div>
            {/* Grid sản phẩm không có khung, không bo góc, không scroll riêng */}
            <ProductGrid
              products={paginatedProducts}
              onViewDetails={(id) => navigate(`/product/${id}`)}
            />
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2 select-none">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white shadow transition hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                >
                  <span className="text-xl">&lt;</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border transition font-semibold shadow
                    ${
                      currentPage === i + 1
                        ? "bg-black text-white border-black scale-110"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    }
                  `}
                    onClick={() => setCurrentPage(i + 1)}
                    aria-current={currentPage === i + 1 ? "page" : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white shadow transition hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                >
                  <span className="text-xl">&gt;</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
