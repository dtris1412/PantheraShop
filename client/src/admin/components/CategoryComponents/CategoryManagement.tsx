import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { showToast } from "../../../shared/components/Toast";
import ConfirmDialog from "../ConfirmDialog";
import { useCategory } from "../../contexts/categoryContext";

interface Category {
  category_id: number;
  category_name: string;
  category_description?: string;
  created_at: string;
  product_count?: number;
}

interface CategoryFormData {
  category_name: string;
  category_description: string;
}

const CategoryManagement = () => {
  const {
    getCategoriesPaginated,
    createCategory,
    updateCategory,
    deleteCategory,
    loading,
  } = useCategory();

  const [paginatedCategories, setPaginatedCategories] = useState<Category[]>(
    []
  );
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loadingPaginated, setLoadingPaginated] = useState(false);
  const itemsPerPage = 9;

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  const [formData, setFormData] = useState<CategoryFormData>({
    category_name: "",
    category_description: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch paginated categories
  useEffect(() => {
    fetchPaginatedCategories();
  }, [debouncedSearchTerm, currentPage]);

  const fetchPaginatedCategories = async () => {
    try {
      setLoadingPaginated(true);
      const data = await getCategoriesPaginated(
        debouncedSearchTerm,
        itemsPerPage,
        currentPage
      );
      setPaginatedCategories(data.categories);
      setTotalCategories(data.total);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("Không thể tải danh mục", "error");
    } finally {
      setLoadingPaginated(false);
    }
  };

  const totalPages = Math.ceil(totalCategories / itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.category_id, formData);
        showToast("Cập nhật danh mục thành công", "success");
      } else {
        await createCategory(formData);
        showToast("Tạo danh mục thành công", "success");
      }

      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      fetchPaginatedCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      category_name: category.category_name,
      category_description: category.category_description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.category_id);
      showToast("Xóa danh mục thành công", "success");
      setDeletingCategory(null);
      fetchPaginatedCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      category_name: "",
      category_description: "",
    });
    setEditingCategory(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="text-blue-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">
              Danh mục sản phẩm
            </h1>
          </div>
          <p className="text-gray-600 mt-1">Quản lý các danh mục sản phẩm</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loadingPaginated ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCategories.map((category) => (
            <div
              key={category.category_id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Tag className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {category.category_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.product_count || 0} sản phẩm
                    </p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleEdit(category)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => setDeletingCategory(category)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>

              {category.category_description && (
                <p className="text-sm text-gray-600 mb-4">
                  {category.category_description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Tạo: {formatDate(category.created_at)}</span>
                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  Xem sản phẩm
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {paginatedCategories.length === 0 && !loadingPaginated && (
        <div className="text-center py-12">
          <Tag className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy danh mục
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Chưa có danh mục nào"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
              {Math.min(currentPage * itemsPerPage, totalCategories)} trong tổng{" "}
              {totalCategories} danh mục
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  value={formData.category_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.category_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading
                    ? "Đang lưu..."
                    : editingCategory
                    ? "Cập nhật"
                    : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        title="Xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${deletingCategory?.category_name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onClose={() => setDeletingCategory(null)}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default CategoryManagement;
