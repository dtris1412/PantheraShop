import { useParams, useNavigate } from "react-router-dom";
import { useBlogContext } from "../../shared/contexts/blogContext";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function BlogDetail() {
  const { blog_id } = useParams();
  const navigate = useNavigate();
  const { blogs, loading, error } = useBlogContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (error)
    return <div className="text-center py-20 text-red-600">{error}</div>;

  const blog = blogs.find((b) => String(b.blog_id) === String(blog_id));
  if (!blog)
    return <div className="text-center py-20">Không tìm thấy bài viết.</div>;

  return (
    <div className="pt-24 pb-12 max-w-3xl mx-auto px-4">
      <button
        className="mb-6 flex items-center gap-2 text-black font-semibold hover:underline"
        onClick={() => navigate("/blog")}
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Blog
      </button>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.blog_title}</h1>
      <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span>{(blog as any).User?.user_name || "Admin"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>
            {(() => {
              const date = new Date(blog.created_at);
              const day = date.getUTCDate();
              const month = date.getUTCMonth() + 1;
              const year = date.getUTCFullYear();
              return `${day}/${month}/${year}`;
            })()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold">
            {(blog as any).Sport?.sport_name}
          </span>
        </div>
      </div>
      <img
        src={
          blog.blog_thumbnail || "https://placehold.co/600x400?text=No+Image"
        }
        alt={blog.blog_title}
        className="w-full h-80 object-cover mb-8"
      />
      <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
        {blog.blog_content}
      </div>
    </div>
  );
}
