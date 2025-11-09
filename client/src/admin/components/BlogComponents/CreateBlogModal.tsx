import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { showToast } from "../../../shared/components/Toast";
import { useBlog } from "../../contexts/blogContext";
import { useCategory } from "../../contexts/categoryContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const apiUrl = import.meta.env.VITE_API_URL;
interface CreateBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBlogModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateBlogModalProps) => {
  const { createBlog } = useBlog();
  const {
    getAllSports,
    getTournamentsBySport,
    getTeamsByTournament,
    getAllCategories,
  } = useCategory();

  const [formData, setFormData] = useState({
    blog_title: "",
    blog_content: "",
    blog_thumbnail: "",
    sport_id: "",
    team_id: "",
    category_id: "",
    tournament_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    try {
      const [sportsData, categoriesData] = await Promise.all([
        getAllSports(),
        getAllCategories(),
      ]);
      setSports(sportsData);
      setCategories(categoriesData);
    } catch (error) {
      showToast("Không thể tải dữ liệu", "error");
    }
  };

  useEffect(() => {
    if (formData.sport_id) {
      getTournamentsBySport(Number(formData.sport_id)).then(setTournaments);
    } else {
      setTournaments([]);
    }
    setFormData((prev) => ({ ...prev, tournament_id: "", team_id: "" }));
  }, [formData.sport_id]);

  useEffect(() => {
    if (formData.tournament_id) {
      getTeamsByTournament(Number(formData.tournament_id)).then(setTeams);
    } else {
      setTeams([]);
    }
    setFormData((prev) => ({ ...prev, team_id: "" }));
  }, [formData.tournament_id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Kích thước ảnh không được vượt quá 5MB", "error");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    const response = await fetch(`${apiUrl}/admin/upload-blog-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload ảnh thất bại");
    }

    const data = await response.json();
    return data.imageUrl; // Đúng key trả về từ backend
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, blog_content: content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = formData.blog_thumbnail;
      if (imageFile) {
        thumbnailUrl = await uploadImageToCloudinary(imageFile);
      }
      const submitData = {
        ...formData,
        blog_thumbnail: thumbnailUrl,
        sport_id: formData.sport_id ? Number(formData.sport_id) : undefined,
        team_id: formData.team_id ? Number(formData.team_id) : undefined,
        category_id: formData.category_id
          ? Number(formData.category_id)
          : undefined,
        tournament_id: formData.tournament_id
          ? Number(formData.tournament_id)
          : undefined,
      };
      await createBlog(submitData);
      showToast("Tạo blog thành công!", "success");
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      showToast(error.message || "Có lỗi xảy ra khi tạo blog", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      blog_title: "",
      blog_content: "",
      blog_thumbnail: "",
      sport_id: "",
      team_id: "",
      category_id: "",
      tournament_id: "",
    });
    setImageFile(null);
    setImagePreview("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">TẠO BLOG MỚI</h2>
            <p className="text-sm text-gray-500 mt-1">
              Thêm bài viết mới cho hệ thống
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              TIÊU ĐỀ *
            </label>
            <input
              type="text"
              name="blog_title"
              value={formData.blog_title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
              placeholder="Nhập tiêu đề blog"
              required
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              ẢNH THUMBNAIL *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
              required={!imagePreview}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Thumbnail preview"
                className="mt-3 w-32 h-32 object-cover border-2 border-gray-300"
              />
            )}
          </div>

          {/* Content with Rich Text Editor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              NỘI DUNG *
            </label>
            <ReactQuill
              theme="snow"
              value={formData.blog_content}
              onChange={handleContentChange}
              className="bg-white"
              style={{ minHeight: "300px" }}
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                Môn thể thao
              </label>
              <select
                name="sport_id"
                value={formData.sport_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
              >
                <option value="">Chọn môn thể thao</option>
                {sports.map((sport: any) => (
                  <option key={sport.sport_id} value={sport.sport_id}>
                    {sport.sport_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                Giải đấu
              </label>
              <select
                name="tournament_id"
                value={formData.tournament_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
              >
                <option value="">Chọn giải đấu</option>
                {tournaments.map((t: any) => (
                  <option key={t.tournament_id} value={t.tournament_id}>
                    {t.tournament_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                Đội bóng
              </label>
              <select
                name="team_id"
                value={formData.team_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
              >
                <option value="">Chọn đội bóng</option>
                {teams.map((team: any) => (
                  <option key={team.team_id} value={team.team_id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                Danh mục
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat: any) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white flex items-center justify-between gap-4 pt-8 border-t mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-200 font-medium uppercase tracking-wider"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-black text-white hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium uppercase tracking-wider"
            >
              {loading ? "Đang tạo..." : "Tạo blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogModal;
