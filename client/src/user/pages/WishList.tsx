import { useState, useEffect } from "react";
import {
  ArrowRight,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Heart,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { showToast } from "../../shared/components/Toast.tsx";
import VariantSelectModal from "../components/VariantSelectModal.tsx";
import { useWishlist } from "../../shared/contexts/wishlistContext";
import ProductFilterBar from "../components/ProductFilterBar";
import { useAuth } from "../../shared/contexts/authContext";

interface Variant {
  wishlist_variant_id: number;
  variant_id: number;
  product_id: number;
  variant_size?: string | null;
  variant_color?: string | null;
  product_name: string;
  product_image?: string | null;
  product_price?: number | null;
  product_rating?: number | null;
  sport?: string | null;
  added_at: string;
}

export default function WishList() {
  const {
    variants,
    loading,
    remove,
    changeVariant,
    refresh,
    fetchWishlistItemsPaginated,
  } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sizeFilter, setSizeFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [changingItem, setChangingItem] = useState<Variant | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedItems, setPaginatedItems] = useState<Variant[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingPaginated, setLoadingPaginated] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Bạn cần phải đăng nhập để truy cập trang này", "error");
      navigate("/login");
    }
  }, [navigate, isAuthenticated]);

  // Debounce search 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch paginated items khi filter/sort/page thay đổi
  useEffect(() => {
    setLoadingPaginated(true);
    fetchWishlistItemsPaginated({
      search: debouncedSearch,
      page: currentPage,
      limit: itemsPerPage,
      size: sizeFilter || undefined,
      color: colorFilter || undefined,
      sortOrder,
    }).then(({ items, total }) => {
      setPaginatedItems(items);
      setTotalItems(total);
      setLoadingPaginated(false);
    });
  }, [
    debouncedSearch,
    currentPage,
    sizeFilter,
    colorFilter,
    sortOrder,
    fetchWishlistItemsPaginated,
  ]);

  // Reset về trang 1 khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sizeFilter, colorFilter, sortOrder]);

  // Lấy danh sách size, color từ toàn bộ variants (không phân trang) để filter
  const sizeList = Array.from(
    new Set(variants.map((v) => v.variant_size).filter(Boolean))
  );
  const colorList = Array.from(
    new Set(variants.map((v) => v.variant_color).filter(Boolean))
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const redirectTo = location.state?.from || "/";

  const handleLoginSuccess = () => {
    // ...xử lý đăng nhập...
    navigate(redirectTo);
  };

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  // Sử dụng remove và changeVariant từ context
  function handleRemoveWishlist(
    wishlist_variant_id: number,
    variant_id: number
  ) {
    remove(wishlist_variant_id, variant_id);
  }

  async function handleChangeVariant(
    wishlist_variant_id: number,
    old_variant_id: number,
    newVariant: {
      variant_id: number;
      variant_size?: string | null;
      variant_color?: string | null;
    }
  ) {
    const payload = {
      variant_id: newVariant.variant_id,
      variant_size: newVariant.variant_size ?? undefined,
      variant_color: newVariant.variant_color ?? undefined,
    };
    await changeVariant(wishlist_variant_id, old_variant_id, payload);
    setShowVariantModal(false);
    setChangingItem(null);
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Danh sách yêu thích</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar filter */}
          <aside className="md:col-span-1 bg-white border border-gray-200 rounded-lg p-6 h-fit">
            <div className="mb-6 flex items-center gap-2 font-bold text-lg">
              <Filter className="w-5 h-5" />
              Bộ lọc
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Tìm kiếm</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border px-2 py-1 rounded"
                placeholder="Tên sản phẩm..."
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Kích cỡ</label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="">Tất cả</option>
                {sizeList.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Màu sắc</label>
              <select
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="">Tất cả</option>
                {colorList.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Sắp xếp</label>
              <div className="flex gap-2">
                <button
                  className={`flex items-center gap-1 px-3 py-1 border rounded ${
                    sortOrder === "desc"
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => setSortOrder("desc")}
                >
                  <SortDesc className="w-4 h-4" />
                  Mới nhất
                </button>
                <button
                  className={`flex items-center gap-1 px-3 py-1 border rounded ${
                    sortOrder === "asc"
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => setSortOrder("asc")}
                >
                  <SortAsc className="w-4 h-4" />
                  Cũ nhất
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="md:col-span-3">
            {loadingPaginated ? (
              <div className="text-center py-20">Đang tải...</div>
            ) : paginatedItems.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                Không có sản phẩm yêu thích nào.
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {paginatedItems.map((item) => (
                    <div
                      key={item.wishlist_variant_id}
                      className="flex bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden relative"
                      onClick={() => navigate(`/product/${item.product_id}`)}
                    >
                      <div className="relative w-40 h-40 flex-shrink-0">
                        <img
                          src={
                            item.product_image ||
                            "https://placehold.co/400x400?text=No+Image"
                          }
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                        {/* Icon Heart giữ nguyên vị trí */}
                        <button
                          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWishlist(
                              item.wishlist_variant_id,
                              item.variant_id
                            );
                          }}
                          title="Xóa khỏi yêu thích"
                        >
                          <Heart
                            className="w-5 h-5 text-black"
                            fill="currentColor"
                          />
                        </button>
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-between relative">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            {item.sport}
                          </div>
                          <div className="font-bold text-lg mb-1">
                            {item.product_name}
                          </div>
                          {item.product_rating !== undefined && (
                            <div className="text-yellow-500 text-xs mb-1">
                              ⭐ {item.product_rating}
                            </div>
                          )}
                          <div className="flex gap-4 text-sm mb-2">
                            <span>
                              Kích cỡ: <b>{item.variant_size}</b>
                            </span>
                            <span>
                              Màu: <b>{item.variant_color}</b>
                            </span>
                          </div>
                        </div>
                        <div className="font-semibold text-base text-black">
                          {formatVND(item.product_price ?? 0)}
                        </div>
                        {/* Nút X và Đổi size/màu căn giữa trục Y, nằm bên phải */}
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-row items-center gap-2">
                          <button
                            className="px-4 py-1 border border-black text-black text-base rounded hover:bg-gray-100 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setChangingItem(item);
                              setShowVariantModal(true);
                            }}
                          >
                            Đổi size/màu
                          </button>
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveWishlist(
                                item.wishlist_variant_id,
                                item.variant_id
                              );
                            }}
                            title="Xóa khỏi yêu thích"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-1 select-none">
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
                    {(() => {
                      let pages: (number | string)[] = [];
                      if (totalPages <= 5) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        pages.push(1, 2);
                        if (currentPage > 3) pages.push("...");
                        for (
                          let i = Math.max(3, currentPage - 1);
                          i <= Math.min(totalPages - 2, currentPage + 1);
                          i++
                        ) {
                          if (i !== 1 && i !== totalPages) pages.push(i);
                        }
                        if (currentPage < totalPages - 2) pages.push("...");
                        pages.push(totalPages - 1, totalPages);
                        pages = pages.filter(
                          (p, idx, arr) =>
                            typeof p === "string" ||
                            (p >= 1 &&
                              p <= totalPages &&
                              arr.indexOf(p) === idx)
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
                            aria-current={
                              currentPage === p ? "page" : undefined
                            }
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
              </>
            )}
          </main>
        </div>
      </div>
      {showVariantModal && changingItem && (
        <VariantSelectModal
          productId={changingItem.product_id}
          currentSize={changingItem.variant_size ?? undefined}
          currentColor={changingItem.variant_color ?? undefined}
          onClose={() => {
            setShowVariantModal(false);
            setChangingItem(null);
          }}
          onUpdate={(variant) =>
            handleChangeVariant(
              changingItem.wishlist_variant_id,
              changingItem.variant_id,
              variant
            )
          }
        />
      )}
    </div>
  );
}
