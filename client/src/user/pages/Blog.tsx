import { Calendar, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBlogContext } from "../../shared/contexts/blogContext";
import { useEffect, useState, useCallback } from "react";

export default function Blog() {
  const navigate = useNavigate();
  const { getBlogsPaginated } = useBlogContext();

  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sport, setSport] = useState("");
  const [tournament, setTournament] = useState("");
  const [category] = useState("");
  const [team] = useState("");
  const [sportList, setSportList] = useState<
    Array<{ sport_id: number; sport_name: string }>
  >([]);
  const [tournamentList, setTournamentList] = useState<
    Array<{ tournament_id: number; tournament_name: string }>
  >([]);
  const itemsPerPage = 9;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fetch full lists for filters
    const fetchFilterData = async () => {
      try {
        const [sportsRes, tournamentsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/sports`),
          fetch(`${import.meta.env.VITE_API_URL}/tournaments`),
        ]);

        const sportsData = await sportsRes.json();
        const tournamentsData = await tournamentsRes.json();

        // Sport controller returns array directly
        if (Array.isArray(sportsData)) {
          setSportList(sportsData);
        }

        // Tournament controller returns { success, tournaments }
        if (tournamentsData.success && tournamentsData.tournaments) {
          setTournamentList(tournamentsData.tournaments);
        }
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };

    fetchFilterData();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sport, tournament, category, team]);

  // Fetch blogs with pagination
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBlogsPaginated(
        debouncedSearch,
        sport,
        category,
        team,
        tournament,
        itemsPerPage,
        currentPage
      );

      setBlogs(result.blogs || []);
      setTotalPages(result.pagination.totalPages || 1);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Không thể tải danh sách blog");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    sport,
    category,
    team,
    tournament,
    currentPage,
    getBlogsPaginated,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Generate page numbers
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const featuredPost = blogs[0];
  const regularPosts = blogs.slice(1);

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

        {/* SEARCH BAR */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Tìm kiếm blog theo tiêu đề hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
          />
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
                <option key={s.sport_id} value={s.sport_id.toString()}>
                  {s.sport_name}
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
                <option
                  key={t.tournament_id}
                  value={t.tournament_id.toString()}
                >
                  {t.tournament_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING, ERROR, NO DATA */}
        {loading && <div className="text-center py-20">Đang tải...</div>}
        {error && <div className="text-center py-20 text-red-600">{error}</div>}
        {!loading && !error && !blogs.length && (
          <div className="text-center py-20">
            Không tìm thấy bài viết nào phù hợp với bộ lọc.
          </div>
        )}

        {/* FEATURED POST */}
        {!loading && !error && blogs.length > 0 && (
          <>
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

            {/* REGULAR POSTS */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold">Bài viết mới nhất</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post: any) => (
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

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ←
                </button>

                {getPageNumbers().map((pageNum, idx) =>
                  pageNum === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum as number)}
                      className={`px-3 py-1 border ${
                        currentPage === pageNum
                          ? "bg-black text-white border-black"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
