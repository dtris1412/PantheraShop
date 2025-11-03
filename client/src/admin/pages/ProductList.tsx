import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { useProduct } from "../contexts/productContext";
import { showToast } from "../../shared/components/Toast";
import { useNavigate } from "react-router-dom";
import ProductFilter from "../components/ProductFilter";
import CreateProductForm from "../components/ProductComponents/CreateProductForm";
import EditProductForm from "../components/ProductComponents/EditProductForm";
import ProductDetailModal from "../components/ProductComponents/ProductDetailModal";
import ConfirmDialog from "../components/ConfirmDialog";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    sport_id: null as number | null,
    tournament_id: null as number | null,
    team_id: null as number | null,
    category_id: null as number | null,
    status: "all" as "all" | "in_stock" | "low_stock" | "out_of_stock",
    sortBy: "newest" as
      | "newest"
      | "name_asc"
      | "name_desc"
      | "price_asc"
      | "price_desc",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { getAllProducts, loading } = useProduct();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Fetch products on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productsData = await getAllProducts();
      console.log("Products loaded:", productsData);
      console.log("First product:", productsData[0]);
      console.log("Products length:", productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast("Không thể tải dữ liệu", "error");
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
    fetchData(); // Reload products
    showToast("Tạo sản phẩm thành công", "success");
  };

  const handleProductUpdated = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    fetchData(); // Reload products
    showToast("Cập nhật sản phẩm thành công", "success");
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

  // ✅ Hàm lấy trạng thái sản phẩm
  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        label: "Hết hàng",
        color: "bg-red-100 text-red-800",
        icon: "text-red-600",
      };
    } else if (stock < 20) {
      return {
        label: "Sắp hết",
        color: "bg-yellow-100 text-yellow-800",
        icon: "text-yellow-600",
      };
    } else {
      return {
        label: "Còn hàng",
        color: "bg-green-100 text-green-800",
        icon: "text-green-600",
      };
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      // Search filter
      const matchSearch =
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.product_description &&
          product.product_description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Category filter
      const matchCategory =
        !filters.category_id || product.category_id === filters.category_id;

      // Team filter (assumes product has team_id)
      const matchTeam =
        !filters.team_id ||
        (product.Team && product.Team.team_id === filters.team_id);

      // Tournament filter (through team)
      const matchTournament =
        !filters.tournament_id ||
        (product.Team &&
          product.Team.Tournament &&
          product.Team.Tournament.tournament_id === filters.tournament_id);

      // Sport filter (through team -> tournament)
      const matchSport =
        !filters.sport_id ||
        (product.Team &&
          product.Team.Tournament &&
          product.Team.Tournament.Sport &&
          product.Team.Tournament.Sport.sport_id === filters.sport_id);

      // Status filter
      let matchStatus = true;
      if (filters.status !== "all") {
        if (filters.status === "out_of_stock") {
          matchStatus = product.stock === 0;
        } else if (filters.status === "low_stock") {
          matchStatus = product.stock > 0 && product.stock < 20;
        } else if (filters.status === "in_stock") {
          matchStatus = product.stock >= 20;
        }
      }

      return (
        matchSearch &&
        matchCategory &&
        matchTeam &&
        matchTournament &&
        matchSport &&
        matchStatus
      );
    })
    .sort((a, b) => {
      // Apply sorting
      switch (filters.sortBy) {
        case "name_asc":
          return a.product_name.localeCompare(b.product_name, "vi");
        case "name_desc":
          return b.product_name.localeCompare(a.product_name, "vi");
        case "price_asc": {
          const priceA =
            typeof a.product_price === "string"
              ? parseFloat(a.product_price)
              : a.product_price;
          const priceB =
            typeof b.product_price === "string"
              ? parseFloat(b.product_price)
              : b.product_price;
          return priceA - priceB;
        }
        case "price_desc": {
          const priceA =
            typeof a.product_price === "string"
              ? parseFloat(a.product_price)
              : a.product_price;
          const priceB =
            typeof b.product_price === "string"
              ? parseFloat(b.product_price)
              : b.product_price;
          return priceB - priceA;
        }
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
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
        </div>
      </div>

      {/* Filter Component */}
      <ProductFilter
        filters={filters}
        onFilterChange={setFilters}
        onReset={() =>
          setFilters({
            sport_id: null,
            tournament_id: null,
            team_id: null,
            category_id: null,
            status: "all",
            sortBy: "newest",
          })
        }
        products={products}
      />

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-black">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Còn hàng</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter((p) => p.stock >= 20).length}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sắp hết hàng</p>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter((p) => p.stock > 0 && p.stock < 20).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter((p) => p.stock === 0).length}
              </p>
            </div>
            <Package className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-2 text-lg font-medium">
            Không tìm thấy sản phẩm
          </div>
          <div className="text-sm text-gray-500">
            {products.length === 0
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
                  <th className="px-6 py-4">Tồn kho</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock); // ✅ Đổi
                  return (
                    <tr
                      key={product.product_id}
                      className="hover:bg-gray-50 transition-colors duration-200"
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
                        <div className="flex items-center gap-2">
                          {product.stock < 20 &&
                            product.stock > 0 && ( // ✅ Đổi
                              <AlertTriangle
                                size={16}
                                className={stockStatus.icon}
                              />
                            )}
                          <span className="text-sm font-medium text-gray-900">
                            {product.stock} {/* ✅ Đổi */}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium ${stockStatus.color}`}
                        >
                          {stockStatus.label}
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
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 hover:bg-red-50 transition-colors duration-200"
                            title="Xóa"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-medium">
                  {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}
                </span>{" "}
                của{" "}
                <span className="font-medium">{filteredProducts.length}</span>{" "}
                sản phẩm
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        currentPage === page
                          ? "bg-black text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
    </div>
  );
};

export default ProductList;
