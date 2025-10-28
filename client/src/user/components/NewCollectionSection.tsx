import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBlogContext } from "../../shared/contexts/blogContext";

export default function NewCollectionSection() {
  const navigate = useNavigate();
  const { blogs, loading, error } = useBlogContext();
  const latestBlog = blogs[0];

  if (loading)
    return (
      <section className="bg-gray-100 py-20 text-center">
        Đang tải blog...
      </section>
    );
  if (error)
    return (
      <section className="bg-gray-100 py-20 text-center text-red-600">
        {error}
      </section>
    );
  if (!latestBlog)
    return (
      <section className="bg-gray-100 py-20 text-center">
        Không có blog mới nhất.
      </section>
    );

  // Lấy 2 blog tiếp theo
  const nextBlogs = blogs.slice(1, 3);

  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Tiêu đề và nút xem thêm */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Tin tức</h2>
          <button
            className="flex items-center gap-2 text-black font-semibold hover:underline text-base"
            onClick={() => navigate("/blog")}
          >
            Xem thêm <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
          {/* Blog nổi bật */}
          <div>
            <img
              src={
                latestBlog.blog_thumbnail ||
                "https://placehold.co/600x400?text=No+Image"
              }
              alt={latestBlog.blog_title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              {latestBlog.blog_title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {latestBlog.blog_content?.slice(0, 120) + "..."}
            </p>
            <button
              onClick={() => navigate(`/blog/${latestBlog.blog_id}`)}
              className="bg-black text-white px-8 py-4 font-semibold hover:bg-gray-800 transition-colors inline-flex items-center space-x-2"
            >
              <span>Đọc bài viết</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2 Blog tiếp theo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {nextBlogs.map((blog) => (
            <div
              key={blog.blog_id}
              className="cursor-pointer"
              onClick={() => navigate(`/blog/${blog.blog_id}`)}
            >
              <img
                src={
                  blog.blog_thumbnail ||
                  "https://placehold.co/600x400?text=No+Image"
                }
                alt={blog.blog_title}
                className="w-full h-full object-cover"
                style={{ height: "400px" }}
              />
              <div className="pt-3">
                <h3 className="font-bold text-lg mb-1">{blog.blog_title}</h3>
                <p className="text-gray-600 text-sm mb-1 line-clamp-2">
                  {blog.blog_content?.slice(0, 80) + "..."}
                </p>
                <div className="text-xs text-gray-500 mb-2">
                  {(() => {
                    const date = new Date(blog.created_at);
                    const day = date.getUTCDate();
                    const month = date.getUTCMonth() + 1;
                    const year = date.getUTCFullYear();
                    return `${day}/${month}/${year}`;
                  })()}
                </div>
                <button
                  className="bg-black text-white px-4 py-2 font-semibold hover:bg-gray-800 transition-colors inline-flex items-center space-x-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/blog/${blog.blog_id}`);
                  }}
                >
                  <span>Đọc bài viết</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
