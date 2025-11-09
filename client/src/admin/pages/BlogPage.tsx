import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit2, Trash2, FileText } from "lucide-react";
import { useBlog, Blog } from "../contexts/blogContext";
import { useCategory } from "../contexts/categoryContext";
import { showToast } from "../../shared/components/Toast";
import CreateBlogModal from "../components/BlogComponents/CreateBlogModal";
import EditBlogModal from "../components/BlogComponents/EditBlogModal";
import ViewBlogModal from "../components/BlogComponents/ViewBlogModal";

const BlogPage = () => {
  const { blogs, getAllBlogs, deleteBlog, loading } = useBlog();
  const { getAllSports } = useCategory();
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [sports, setSports] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Blog | null>(null);

  useEffect(() => {
    loadBlogs();
    loadSports();
  }, []);

  const loadBlogs = async () => {
    try {
      await getAllBlogs();
    } catch (error) {
      console.error("Error loading blogs:", error);
    }
  };

  const loadSports = async () => {
    try {
      const sportsData = await getAllSports();
      setSports(sportsData || []);
    } catch (error) {
      console.error("Error loading sports:", error);
    }
  };

  const handleCreateSuccess = () => {
    loadBlogs();
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = () => {
    loadBlogs();
    setEditBlog(null);
  };

  const handleDelete = async (blogId: number) => {
    try {
      await deleteBlog(blogId);
      showToast("Xóa blog thành công!", "success");
      loadBlogs();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("Error deleting blog:", error);
      showToast(error.message || "Có lỗi xảy ra khi xóa blog", "error");
    }
  };

  // Filter blogs
  const filteredBlogs = (blogs || []).filter((blog) => {
    const matchesSearch = blog.blog_title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSport =
      sportFilter === "all" ||
      (blog.sport_id && String(blog.sport_id) === sportFilter);
    return matchesSearch && matchesSport;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QUẢN LÝ BLOG</h1>
            <p className="text-gray-600 mt-2">Quản lý bài viết cho hệ thống</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-all duration-200 font-semibold uppercase tracking-wider"
          >
            <Plus size={20} />
            Tạo Blog
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
              />
            </div>

            {/* Sport Filter */}
            <div>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 bg-white"
              >
                <option value="all">Tất cả môn thể thao</option>
                {sports.map((sport) => (
                  <option key={sport.sport_id} value={sport.sport_id}>
                    {sport.sport_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải blogs...</p>
        </div>
      )}

      {/* Blogs Grid */}
      {!loading && filteredBlogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.blog_id}
              className="bg-white border-2 border-gray-200 hover:border-black transition-all duration-300 overflow-hidden group"
            >
              {/* Thumbnail */}
              {blog.blog_thumbnail && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={blog.blog_thumbnail}
                    alt={blog.blog_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold tracking-tight mb-2 line-clamp-2">
                  {blog.blog_title}
                </h3>

                {/* Author & Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  {blog.User && <span>{blog.User.user_name}</span>}
                  {blog.created_at && (
                    <>
                      <span>•</span>
                      <span>{formatDate(blog.created_at)}</span>
                    </>
                  )}
                </div>

                {/* Preview Content */}
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {stripHtml(blog.blog_content)}
                </p>

                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.Sport && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold">
                      {blog.Sport.sport_name}
                    </span>
                  )}
                  {blog.Team && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold">
                      {blog.Team.team_name}
                    </span>
                  )}
                  {blog.Category && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold">
                      {blog.Category.category_name}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewBlog(blog)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-semibold"
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                    Xem
                  </button>
                  <button
                    onClick={() => setEditBlog(blog)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={16} />
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(blog)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBlogs.length === 0 && (
        <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Không tìm thấy blog
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Thử thay đổi từ khóa tìm kiếm hoặc tạo blog mới"
              : "Chưa có blog nào. Tạo blog đầu tiên ngay!"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-all duration-200 font-semibold uppercase tracking-wider"
            >
              Tạo Blog Đầu Tiên
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8">
            <h3 className="text-xl font-bold mb-4">XÁC NHẬN XÓA</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa blog "{deleteConfirm.blog_title}"? Hành
              động này không thể hoàn tác.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-200 font-semibold uppercase"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.blog_id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-all duration-200 font-semibold uppercase"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateBlogModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {editBlog && (
        <EditBlogModal
          isOpen={!!editBlog}
          onClose={() => setEditBlog(null)}
          onSuccess={handleEditSuccess}
          blog={editBlog}
        />
      )}

      {viewBlog && (
        <ViewBlogModal
          isOpen={!!viewBlog}
          onClose={() => setViewBlog(null)}
          blog={viewBlog}
        />
      )}
    </div>
  );
};

export default BlogPage;
