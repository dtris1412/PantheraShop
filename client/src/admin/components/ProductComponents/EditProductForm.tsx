import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { showToast } from "../../../shared/components/Toast";
import { useProduct } from "../../contexts/productContext";
import { useCategory } from "../../contexts/categoryContext";

interface Category {
  category_id: number;
  category_name: string;
}

interface Sport {
  sport_id: number;
  sport_name: string;
  sport_icon?: string;
}

interface Tournament {
  tournament_id: number;
  tournament_name: string;
  tournament_icon?: string;
  sport_id: number;
}

interface Team {
  team_id: number;
  team_name: string;
  team_logo?: string;
  tournament_id: number;
}

interface ProductVariant {
  variant_id?: number;
  variant_size: string;
  variant_color: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_description: string | null;
  product_price: number | string;
  category_id: number;
  team_id?: number;
  product_image: string | null;
  created_at?: string;
  Category?: Category;
  Team?: {
    team_id: number;
    team_name: string;
    Tournament?: {
      tournament_id: number;
      tournament_name: string;
      Sport?: Sport;
    };
  };
  Variants?: ProductVariant[];
}

interface EditProductFormProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductForm = ({
  isOpen,
  product,
  onClose,
  onSuccess,
}: EditProductFormProps) => {
  const { updateProduct } = useProduct();
  const { getAllCategories, getAllSports, getAllTournaments, getAllTeams } =
    useCategory();

  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    product_price: "",
    category_id: "",
    sport_id: "",
    tournament_id: "",
    team_id: "",
    product_image: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { variant_size: "", variant_color: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch initial data
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  // Load product data when modal opens
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        product_name: product.product_name,
        product_description: product.product_description || "",
        product_price:
          typeof product.product_price === "number"
            ? product.product_price.toString()
            : product.product_price,
        category_id: product.category_id.toString(),
        sport_id: product.Team?.Tournament?.Sport?.sport_id?.toString() || "",
        tournament_id:
          product.Team?.Tournament?.tournament_id?.toString() || "",
        team_id: product.team_id?.toString() || "",
        product_image: product.product_image || "",
      });

      // Set image preview
      if (product.product_image) {
        setImagePreview(product.product_image);
      }

      // Set variants
      if (product.Variants && product.Variants.length > 0) {
        setVariants(
          product.Variants.map((v) => ({
            variant_id: v.variant_id,
            variant_size: v.variant_size || "",
            variant_color: v.variant_color || "",
          }))
        );
      } else {
        setVariants([{ variant_size: "", variant_color: "" }]);
      }
    }
  }, [product, isOpen]);

  // Filter tournaments by selected sport
  useEffect(() => {
    if (formData.sport_id) {
      const filteredTournaments = tournaments.filter(
        (t) => t.sport_id === parseInt(formData.sport_id)
      );
      if (
        formData.tournament_id &&
        !filteredTournaments.find(
          (t) => t.tournament_id === parseInt(formData.tournament_id)
        )
      ) {
        setFormData((prev) => ({ ...prev, tournament_id: "", team_id: "" }));
      }
    }
  }, [formData.sport_id, tournaments]);

  // Filter teams by selected tournament
  useEffect(() => {
    if (formData.tournament_id) {
      const filteredTeams = teams.filter(
        (t) => t.tournament_id === parseInt(formData.tournament_id)
      );
      if (
        formData.team_id &&
        !filteredTeams.find((t) => t.team_id === parseInt(formData.team_id))
      ) {
        setFormData((prev) => ({ ...prev, team_id: "" }));
      }
    }
  }, [formData.tournament_id, teams]);

  const fetchInitialData = async () => {
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
      console.error("Error fetching data:", error);
      showToast("Không thể tải dữ liệu", "error");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { variant_size: "", variant_color: "" }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          product_image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("All variants:", variants);

      // Filter valid variants - at least one field (size OR color) must be filled
      const validVariants = variants.filter(
        (v) => v.variant_size?.trim() || v.variant_color?.trim()
      );

      console.log("Valid variants after filter:", validVariants);

      // Add default values and stock for each variant
      const variantsWithDefaults = validVariants.map((v) => ({
        variant_id: v.variant_id,
        variant_size: v.variant_size?.trim() || "Standard",
        variant_color: v.variant_color?.trim() || "Default",
        variant_stock: 0,
      }));

      // TODO: Implement API call
      console.log("Updated product data:", {
        product_id: product?.product_id,
        ...formData,
        variants:
          variantsWithDefaults.length > 0 ? variantsWithDefaults : undefined,
      });

      // Mock success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showToast(
        "Chức năng đang phát triển - Sẽ cập nhật sản phẩm thành công",
        "success"
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      showToast("Có lỗi xảy ra khi cập nhật sản phẩm", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Chỉnh sửa sản phẩm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Thông tin cơ bản</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="product_description"
                  value={formData.product_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá (VNĐ) *
                </label>
                <input
                  type="number"
                  name="product_price"
                  value={formData.product_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đội/CLB
                </label>
                <select
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                >
                  <option value="">Chọn đội/CLB</option>
                  {teams.map((team) => (
                    <option key={team.team_id} value={team.team_id}>
                      {team.team_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hình ảnh</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh chính
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {formData.product_image ? (
                    <div className="relative">
                      <img
                        src={formData.product_image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            product_image: "",
                          }))
                        }
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">
                            Tải lên hình ảnh
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Biến thể sản phẩm</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Nhập ít nhất kích cỡ HOẶC màu sắc (hoặc cả hai). Để trống nếu
                  sản phẩm không có biến thể.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Thêm biến thể
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Kích cỡ{" "}
                      <span className="text-gray-400 font-normal">
                        (tùy chọn)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={variant.variant_size}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "variant_size",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="S, M, L, XL... (bỏ trống nếu không có)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Màu sắc{" "}
                      <span className="text-gray-400 font-normal">
                        (tùy chọn)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={variant.variant_color}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "variant_color",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="Đỏ, Xanh, Vàng... (bỏ trống nếu không có)"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="w-full px-2 py-1.5 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors"
                      title="Xóa biến thể"
                    >
                      <Trash2 size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;
