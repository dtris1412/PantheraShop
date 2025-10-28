import { Calendar, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBlogContext } from "../contexts/blogContext";
import { useEffect, useState } from "react";

export default function Blog() {
  const navigate = useNavigate();
  const { blogs, loading, error } = useBlogContext();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [sport, setSport] = useState("");
  const [tournament, setTournament] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sportList = Array.from(
    new Set(blogs.map((b) => (b as any).Sport?.sport_name).filter(Boolean))
  );
  const tournamentList = Array.from(
    new Set(
      blogs.map((b) => (b as any).Tournament?.tournament_name).filter(Boolean)
    )
  );

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (error)
    return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!blogs.length)
    return <div className="text-center py-20">Chưa có bài viết nào.</div>;

  const featuredPost = blogs[0];
  const regularPosts = blogs.slice(1);

  const filteredPosts = regularPosts
    .filter(
      (post) =>
        (!sport || (post as any).Sport?.sport_name === sport) &&
        (!tournament ||
          (post as any).Tournament?.tournament_name === tournament)
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Blog Huấn Luyện & Hiệu Suất
          </h1>
          <p className="text-gray-600 text-lg">
            Góc nhìn chuyên gia giúp bạn nâng cao thành tích thể thao
          </p>
        </div>

        {/* FEATURED POST */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 mb-4">
                NỔI BẬT
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {featuredPost.blog_title}
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed line-clamp-4">
                {featuredPost.blog_content?.slice(0, 180) + "..."}
              </p>

              <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>
                    {(featuredPost as any).User?.user_name ||
                      (featuredPost as any).author ||
                      "Admin"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {(() => {
                      const date = new Date(featuredPost.created_at);
                      const day = date.getUTCDate();
                      const month = date.getUTCMonth() + 1;
                      const year = date.getUTCFullYear();
                      return `${day}/${month}/${year}`;
                    })()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/blog/${featuredPost.blog_id}`)}
                className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
              >
                <span>Đọc bài viết</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="order-1 lg:order-2">
              <img
                src={
                  featuredPost.blog_thumbnail ||
                  "https://placehold.co/600x400?text=No+Image"
                }
                alt={featuredPost.blog_title}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>

        {/* BỘ LỌC TÌM KIẾM */}
        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <div>
            <label className="font-semibold mr-2">Bộ môn:</label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">Tất cả</option>
              {sportList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold mr-2">Giải đấu:</label>
            <select
              value={tournament}
              onChange={(e) => setTournament(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">Tất cả</option>
              {tournamentList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold mr-2">Sắp xếp:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="border px-2 py-1 rounded"
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* REGULAR POSTS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Bài viết mới nhất</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.blog_id}
              className="group cursor-pointer"
              onClick={() => navigate(`/blog/${post.blog_id}`)}
            >
              <div className="bg-gray-100 mb-4 overflow-hidden">
                <img
                  src={
                    post.blog_thumbnail ||
                    "https://placehold.co/600x400?text=No+Image"
                  }
                  alt={post.blog_title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  {(post as any).Sport?.sport_name || "Blog"}
                </span>

                <h3 className="text-xl font-bold group-hover:underline leading-snug">
                  {post.blog_title}
                </h3>

                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  {post.blog_content?.slice(0, 100) + "..."}
                </p>

                <div className="flex items-center space-x-4 text-xs text-gray-600 pt-2">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>
                      {(post as any).User?.user_name ||
                        (post as any).author ||
                        "Admin"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {(() => {
                        const date = new Date(post.created_at);
                        const day = date.getUTCDate();
                        const month = date.getUTCMonth() + 1;
                        const year = date.getUTCFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
