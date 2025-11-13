import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Package,
  Lock,
  FileSpreadsheet,
  Tag,
} from "lucide-react";
import { useProduct } from "../contexts/productContext";
import { useCategory } from "../contexts/categoryContext";
import { showToast } from "../../shared/components/Toast";
import { useNavigate } from "react-router-dom";
import CreateProductForm from "../components/ProductComponents/CreateProductForm";
import EditProductForm from "../components/ProductComponents/EditProductForm";
import ProductDetailModal from "../components/ProductComponents/ProductDetailModal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImportExcelModal from "../components/ProductComponents/ImportExcelModal";

interface Product {
  product_id: number;
  product_name: string;
  product_description: string | null;
  product_price: number | string;
  category_id: number;
  product_image: string | null;
  created_at: string;
  stock: number;
  average_rating: number;
  is_active: boolean;
  Category?: {
    category_id: number;
    category_name: string;
  };
  Team?: {
    team_id: number;
    team_name: string;
    Tournament?: {
      tournament_id: number;
      tournament_name: string;
      Sport?: {
        sport_id: number;
        sport_name: string;
      };
    };
  };
}

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPaginated, setLoadingPaginated] = useState(false);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({
    sport: "",
    tournament: "",
    team: "",
    category: "",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { getProductsPaginated, setProductLockStatus } = useProduct();
  const { getAllCategories, getAllSports, getAllTournaments, getAllTeams } =
    useCategory();
  const navigate = useNavigate();

  // Filter options
  const [categories, setCategories] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesData, sportsData, tournamentsData, teamsData] =
          await Promise.all([
            getAllCategories(),
            getAllSports(),
            getAllTournaments(),
            getAllTeams(),
          ]);
        setCategories(categoriesData);
        setSports(sportsData);
        setTournaments(tournamentsData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    };
    loadFilterOptions();
  }, []);

  // Fetch paginated products
  useEffect(() => {
    fetchPaginatedProducts();
  }, [debouncedSearchTerm, currentPage, filters]);

  const fetchPaginatedProducts = async () => {
    try {
      setLoadingPaginated(true);
      const data = await getProductsPaginated(
        debouncedSearchTerm,
        itemsPerPage,
        currentPage,
        filters.category,
        filters.sport,
        filters.tournament,
        filters.team
      );
      setPaginatedProducts(data.products);
      setTotalProducts(data.total);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Không thể tải sản phẩm", "error");
    } finally {
      setLoadingPaginated(false);
    }
  };

  // CRUD handlers
  const handleCreateProduct = () => {
    setShowCreateModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = () => {
    if (selectedProduct) {
      // TODO: Implement delete API call
      showToast("Chức năng xóa đang phát triển", "info");
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  const handleProductCreated = () => {
    setShowCreateModal(false);
    fetchPaginatedProducts(); // Reload products
    showToast("Tạo sản phẩm thành công", "success");
  };

  const handleProductUpdated = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    fetchPaginatedProducts(); // Reload products
    showToast("Cập nhật sản phẩm thành công", "success");
  };

  const handleLockProduct = async (product: Product) => {
    try {
      await setProductLockStatus(product.product_id, !product.is_active);
      fetchPaginatedProducts(); // Reload products to reflect the change
      showToast(
        `${product.is_active ? "Ngừng bán" : "Đang bán"} sản phẩm thành công`,
        "success"
      );
    } catch (error) {
      console.error("Failed to update product status:", error);
      showToast("Không thể cập nhật trạng thái sản phẩm", "error");
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded ${
              currentPage === i
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          1
        </button>
      );

      pages.push(
        <button
          key={2}
          onClick={() => handlePageChange(2)}
          className={`px-3 py-1 rounded ${
            currentPage === 2
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          2
        </button>
      );

      if (currentPage > 4) {
        pages.push(
          <span key="dots1" className="px-2">
            ...
          </span>
        );
      }

      const start = Math.max(3, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 2 && i < totalPages - 1) {
          pages.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-3 py-1 rounded ${
                currentPage === i
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i}
            </button>
          );
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push(
          <span key="dots2" className="px-2">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages - 1}
          onClick={() => handlePageChange(totalPages - 1)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages - 1
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {totalPages - 1}
        </button>
      );

      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (loadingPaginated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin sản phẩm và danh mục
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-black hover:bg-gray-50 transition-colors duration-200"
          >
            <Tag size={20} />
            <span className="font-medium">Danh mục</span>
          </button>
          <button
            type="button"
            onClick={handleCreateProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors duration-200"
          >
            <Plus size={20} />
            <span className="font-medium">Thêm sản phẩm</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
          >
            <FileSpreadsheet size={20} />
            <span className="font-medium">Import Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Component - Dropdowns */}
      <div className="bg-white p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_name}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn thể thao
            </label>
            <select
              value={filters.sport}
              onChange={(e) => {
                setFilters({ ...filters, sport: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            >
              <option value="">Tất cả môn thể thao</option>
              {sports.map((sport) => (
                <option key={sport.sport_id} value={sport.sport_name}>
                  {sport.sport_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giải đấu
            </label>
            <select
              value={filters.tournament}
              onChange={(e) => {
                setFilters({ ...filters, tournament: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            >
              <option value="">Tất cả giải đấu</option>
              {tournaments.map((tournament) => (
                <option
                  key={tournament.tournament_id}
                  value={tournament.tournament_name}
                >
                  {tournament.tournament_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đội/CLB
            </label>
            <select
              value={filters.team}
              onChange={(e) => {
                setFilters({ ...filters, team: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            >
              <option value="">Tất cả đội</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_name}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(filters.category ||
          filters.sport ||
          filters.tournament ||
          filters.team) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setFilters({
                  sport: "",
                  tournament: "",
                  team: "",
                  category: "",
                });
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 border border-gray-200 border-t-0">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 relative min-w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-black">{totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trang hiện tại</p>
              <p className="text-2xl font-bold text-green-600">
                {paginatedProducts.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng trang</p>
              <p className="text-2xl font-bold text-gray-600">{totalPages}</p>
            </div>
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-2 text-lg font-medium">
            Không tìm thấy sản phẩm
          </div>
          <div className="text-sm text-gray-500">
            {totalProducts === 0
              ? "Chưa có sản phẩm nào trong hệ thống"
              : "Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác"}
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Giá</th>
                  {/* XÓA cột tồn kho và trạng thái kho */}
                  <th className="px-6 py-4">Trạng thái bán</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.product_id}
                    className={`hover:bg-gray-50 transition-colors duration-200 ${
                      !product.is_active ? "opacity-60 bg-gray-100" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.product_image ? (
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="w-12 h-12 object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-black line-clamp-1">
                            {product.product_name}
                          </p>
                          {product.product_description && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {product.product_description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                        {product.Category?.category_name || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-black">
                        {formatPrice(product.product_price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium ${
                          product.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {product.is_active ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewProduct(product)}
                          className="p-2 hover:bg-blue-50 transition-colors duration-200"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          className="p-2 hover:bg-gray-100 transition-colors duration-200"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} className="text-gray-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLockProduct(product)}
                          className="p-2 hover:bg-yellow-50 transition-colors duration-200"
                          title={
                            product.is_active
                              ? "Khóa sản phẩm (Ngừng bán)"
                              : "Mở khóa sản phẩm (Đang bán)"
                          }
                        >
                          <Lock
                            size={16}
                            className={
                              product.is_active
                                ? "text-yellow-600"
                                : "text-gray-400"
                            }
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
                {Math.min(currentPage * itemsPerPage, totalProducts)} trong tổng{" "}
                {totalProducts} sản phẩm
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {renderPageNumbers()}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProductCreated}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <EditProductForm
          isOpen={showEditModal}
          product={selectedProduct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleProductUpdated}
        />
      )}

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          isOpen={showDetailModal}
          product={selectedProduct}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }}
          onEdit={() => handleEditProduct(selectedProduct)}
          onDelete={() => handleDeleteProduct(selectedProduct)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.product_name}"? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteProduct}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedProduct(null);
        }}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      {/* Import Excel Modal */}
      {showImportModal && (
        <ImportExcelModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchPaginatedProducts();
            showToast("Import sản phẩm thành công", "success");
          }}
        />
      )}
    </div>
  );
};

export default ProductList;
