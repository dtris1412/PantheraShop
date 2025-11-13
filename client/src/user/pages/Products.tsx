import ProductFilterBar from "../components/ProductFilterBar";
import SearchProduct from "../components/SearchProduct";
import ProductSortBar from "../components/ProductSortBar";
import ProductGrid from "../components/ProductGrid";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useProduct } from "../../shared/contexts/productContext";
import type { Product } from "../../shared/contexts/productContext";

export default function Products() {
  const navigate = useNavigate();
  const { products, sports, fetchProductsPaginated } = useProduct();
  const topRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();

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
  const [selectedSort, setSelectedSort] = useState("mặc định");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();

  // Debounce searchQuery 3s
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 3s

    return () => clearTimeout(handler);
  }, [searchQuery]);

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
    if (selectedSort === "price-low ") {
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

  useEffect(() => {
    setLoading(true);
    fetchProductsPaginated({
      search: debouncedSearch,
      page: currentPage,
      limit: productsPerPage,
      category: selectedCategory !== "Tất cả" ? selectedCategory : undefined,
      sport: selectedSport || undefined,
      tournament: selectedTournament || undefined,
      team: selectedTeam || undefined,
      minPrice,
      maxPrice,
    }).then(({ products, total }) => {
      setPaginatedProducts(products);
      setTotalProducts(total);
      setLoading(false);
    });
  }, [
    debouncedSearch,
    currentPage,
    selectedCategory,
    selectedSport,
    selectedTournament,
    selectedTeam,
    minPrice,
    maxPrice,
  ]);

  // Tính tổng số trang
  const totalPages = Math.ceil(totalProducts / productsPerPage);

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

  console.log("totalPages:", totalPages);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-white">
      <div ref={topRef} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Tất cả sản phẩm
          </h1>
          <p className="text-gray-600">
            Đang có {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "sản phẩm" : "sản phẩm"}
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
            {/* Thanh tìm kiếm và sort bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex-1">
                <SearchProduct setQuery={setSearchQuery} />
              </div>
              <div>
                <ProductSortBar
                  selectedSort={selectedSort}
                  setSelectedSort={setSelectedSort}
                />
              </div>
            </div>
            <ProductGrid
              products={paginatedProducts}
              onViewDetails={(id) => navigate(`/product/${id}`)}
            />
            {loading && (
              <div className="flex justify-center py-4">
                <span className="loader"></span>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-1 select-none">
                <button
                  className="px-2 text-gray-500 hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed bg-transparent border-none rounded-none"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                  style={{
                    background: "none",
                    border: "none",
                    borderRadius: 0,
                  }}
                >
                  <span className="text-base">&lt;</span>
                </button>
                {/* Hiển thị toàn bộ nếu số trang <= 5, rút gọn nếu lớn hơn */}
                {(() => {
                  let pages: (number | string)[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    // Luôn hiển thị 1, 2
                    pages.push(1, 2);

                    // Nếu currentPage > 3 thì hiển thị ...
                    if (currentPage > 3) pages.push("...");

                    // Hiển thị các trang gần currentPage (trừ đầu/cuối)
                    for (
                      let i = Math.max(3, currentPage - 1);
                      i <= Math.min(totalPages - 2, currentPage + 1);
                      i++
                    ) {
                      if (i !== 1 && i !== totalPages) pages.push(i);
                    }

                    // Nếu currentPage < totalPages - 2 thì hiển thị ...
                    if (currentPage < totalPages - 2) pages.push("...");

                    // Luôn hiển thị trang cuối và áp chót
                    pages.push(totalPages - 1, totalPages);

                    // Loại bỏ trùng lặp, ngoài phạm vi, giữ thứ tự
                    pages = pages.filter(
                      (p, idx, arr) =>
                        typeof p === "string" ||
                        (p >= 1 && p <= totalPages && arr.indexOf(p) === idx)
                    );
                  }
                  return pages.map((p, idx) =>
                    typeof p === "number" ? (
                      <button
                        key={p}
                        className={`px-2 text-lg transition bg-transparent border-none rounded-none
              ${
                currentPage === p
                  ? "text-black font-bold"
                  : "text-gray-700 hover:text-black"
              }
            `}
                        onClick={() => setCurrentPage(p)}
                        aria-current={currentPage === p ? "page" : undefined}
                        style={{
                          background: "none",
                          border: "none",
                          borderRadius: 0,
                        }}
                      >
                        {p}
                      </button>
                    ) : (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-gray-400"
                        style={{
                          background: "none",
                          border: "none",
                          borderRadius: 0,
                        }}
                      >
                        ...
                      </span>
                    )
                  );
                })()}
                <button
                  className="px-2 text-gray-500 hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed bg-transparent border-none rounded-none"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                  style={{
                    background: "none",
                    border: "none",
                    borderRadius: 0,
                  }}
                >
                  <span className="text-base">&gt;</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
