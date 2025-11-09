import { X } from "lucide-react";
import { Blog } from "../../contexts/blogContext";

interface ViewBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog;
}

const ViewBlogModal = ({ isOpen, onClose, blog }: ViewBlogModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">CHI TIẾT BLOG</h2>
            <p className="text-sm text-gray-500 mt-1">
              Xem thông tin chi tiết bài viết
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              TIÊU ĐỀ
            </label>
            <h3 className="text-2xl font-bold">{blog.blog_title}</h3>
          </div>

          {/* Thumbnail */}
          {blog.blog_thumbnail && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                ẢNH THUMBNAIL
              </label>
              <img
                src={blog.blog_thumbnail}
                alt={blog.blog_title}
                className="w-full max-w-md h-auto object-cover border-2 border-gray-300"
              />
            </div>
          )}

          {/* Author */}
          {blog.User && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                TÁC GIẢ
              </label>
              <p className="text-gray-700">{blog.User.user_name}</p>
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              NỘI DUNG
            </label>
            <div
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.blog_content }}
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            {blog.Sport && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  MÔN THỂ THAO
                </label>
                <p className="text-gray-700">{blog.Sport.sport_name}</p>
              </div>
            )}

            {blog.Team && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  ĐỘI BÓNG
                </label>
                <p className="text-gray-700">{blog.Team.team_name}</p>
              </div>
            )}

            {blog.Category && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  DANH MỤC
                </label>
                <p className="text-gray-700">{blog.Category.category_name}</p>
              </div>
            )}

            {blog.Tournament && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  GIẢI ĐẤU
                </label>
                <p className="text-gray-700">
                  {blog.Tournament.tournament_name}
                </p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            {blog.created_at && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  NGÀY TẠO
                </label>
                <p className="text-gray-700">
                  {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            )}

            {blog.updated_at && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  CẬP NHẬT LẦN CUỐI
                </label>
                <p className="text-gray-700">
                  {new Date(blog.updated_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="sticky bottom-0 bg-white pt-8 border-t mt-8">
            <button
              onClick={onClose}
              className="w-full px-6 py-4 bg-black text-white hover:bg-gray-800 transition-all duration-200 font-medium uppercase tracking-wider"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBlogModal;
