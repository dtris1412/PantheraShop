import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { showToast } from "../../../shared/components/Toast";
import { useProduct } from "../../contexts/productContext";
import { useCategory } from "../../contexts/categoryContext";
import { useSupplier } from "../../contexts/supplierContext";

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
  variant_stock?: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface Product {
  product_id: number;
  product_name: string;
  product_description: string | null;
  product_price: number | string;
  category_id: number;
  team_id?: number;
  supplier_id?: number; // Added supplier_id property
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
  const {
    updateProduct,
    getVariantsByProductId,
    createVariant,
    updateVariant,
    deleteVariant,
  } = useProduct();
  const { getAllCategories, getAllSports, getAllTournaments, getAllTeams } =
    useCategory();
  const { suppliers, fetchSuppliers } = useSupplier();

  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    product_price: "",
    category_id: "",
    sport_id: "",
    tournament_id: "",
    team_id: "",
    supplier_id: "", // thêm trường này
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { variant_size: "", variant_color: "", variant_stock: 0, isNew: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch data on mount
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

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
        supplier_id: product.supplier_id?.toString() || "", // gán giá trị supplier_id
      });

      // Set image preview
      if (product.product_image) {
        setImagePreview(product.product_image);
      }

      // Fetch variants
      fetchVariants(product.product_id);
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

  const fetchVariants = async (productId: number) => {
    setLoadingVariants(true);
    try {
      const variants = await getVariantsByProductId(productId);

      if (variants.length > 0) {
        setVariants(
          variants.map((v) => ({
            variant_id: v.variant_id,
            variant_size: v.variant_size || "",
            variant_color: v.variant_color || "",
            variant_stock: v.variant_stock || 0,
            isNew: false,
          }))
        );
      } else {
        setVariants([
          {
            variant_size: "",
            variant_color: "",
            variant_stock: 0,
            isNew: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
      setVariants([
        { variant_size: "", variant_color: "", variant_stock: 0, isNew: true },
      ]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview("");
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
      [field]: field === "variant_stock" ? Number(value) || 0 : value,
    };
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { variant_size: "", variant_color: "", variant_stock: 0, isNew: true },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      showToast("Phải có ít nhất 1 biến thể", "error");
      return;
    }

    const variant = variants[index];

    if (variant.variant_id && !variant.isNew) {
      const updatedVariants = [...variants];
      updatedVariants[index] = { ...variant, isDeleted: true };
      setVariants(updatedVariants);
    } else {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  type CreateProductData = {
    product_name: string;
    product_description: string;
    product_price: string | number;
    category_id: string | number;
    team_id?: string | number;
    supplier_id?: string | number;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("📦 Updating product:", product?.product_id);

      // 1. Update product
      await updateProduct(
        product!.product_id,
        {
          product_name: formData.product_name,
          product_description: formData.product_description,
          product_price: formData.product_price,
          category_id: formData.category_id,
          team_id: formData.team_id || undefined,
          supplier_id: formData.supplier_id, // truyền supplier_id khi cập nhật
        },
        imageFile
      );

      // 2. Process variants
      const variantOperations = [];

      for (const variant of variants) {
        if (
          variant.isDeleted ||
          (!variant.variant_size?.trim() && !variant.variant_color?.trim())
        ) {
          if (variant.variant_id && variant.isDeleted) {
            variantOperations.push(deleteVariant(variant.variant_id));
          }
          continue;
        }

        const variantData = {
          variant_size: variant.variant_size?.trim() || "Standard",
          variant_color: variant.variant_color?.trim() || "Default",
          variant_stock: variant.variant_stock || 0,
          product_id: product!.product_id,
        };

        if (variant.variant_id && !variant.isNew) {
          variantOperations.push(
            updateVariant(variant.variant_id, variantData)
          );
        } else {
          variantOperations.push(createVariant(variantData));
        }
      }

      const results = await Promise.allSettled(variantOperations);

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          console.log(`✅ Variant operation ${index + 1} succeeded`);
        } else {
          console.error(
            `❌ Variant operation ${index + 1} failed:`,
            result.reason
          );
        }
      });

      showToast("Cập nhật sản phẩm thành công!", "success");
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header - Nike Style */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              CHỈNH SỬA SẢN PHẨM
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật thông tin sản phẩm của bạn
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
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image Upload */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
                  HÌNH ẢNH SẢN PHẨM
                </h3>

                {imageFile || imagePreview ? (
                  <div className="relative group">
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : imagePreview
                      }
                      alt="Preview"
                      className="w-full aspect-square object-cover bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="w-full aspect-square border-2 border-dashed border-gray-300 hover:border-black transition-colors duration-200 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100">
                      <Upload size={48} className="text-gray-400 mb-4" />
                      <span className="text-sm font-medium text-gray-600">
                        Nhấn để tải ảnh lên
                      </span>
                      <span className="text-xs text-gray-400 mt-2">
                        Tối đa 5MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            showToast(
                              "Kích thước ảnh không được vượt quá 5MB",
                              "error"
                            );
                            return;
                          }
                          handleImageSelect(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  THÔNG TIN SẢN PHẨM
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                    TÊN SẢN PHẨM *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 text-lg"
                    placeholder="Nhập tên sản phẩm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                    MÔ TẢ
                  </label>
                  <textarea
                    name="product_description"
                    value={formData.product_description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 resize-none"
                    placeholder="Mô tả sản phẩm của bạn..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                    GIÁ (VNĐ) *
                  </label>
                  <input
                    type="number"
                    name="product_price"
                    value={formData.product_price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 text-lg"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  PHÂN LOẠI
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      MÔN THỂ THAO
                    </label>
                    <select
                      name="sport_id"
                      value={formData.sport_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 bg-white"
                    >
                      <option value="">Chọn môn thể thao</option>
                      {sports.map((sport) => (
                        <option key={sport.sport_id} value={sport.sport_id}>
                          {sport.sport_name}
                        </option>
                      ))}
                    </select>
                    {formData.sport_id &&
                      sports.find(
                        (s) => s.sport_id.toString() === formData.sport_id
                      )?.sport_icon && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <img
                            src={
                              sports.find(
                                (s) =>
                                  s.sport_id.toString() === formData.sport_id
                              )?.sport_icon
                            }
                            alt="Sport"
                            className="w-6 h-6 object-contain"
                          />
                          <span>
                            {
                              sports.find(
                                (s) =>
                                  s.sport_id.toString() === formData.sport_id
                              )?.sport_name
                            }
                          </span>
                        </div>
                      )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      GIẢI ĐẤU
                    </label>
                    <select
                      name="tournament_id"
                      value={formData.tournament_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                      disabled={!formData.sport_id}
                    >
                      <option value="">Chọn giải đấu</option>
                      {tournaments
                        .filter(
                          (t) =>
                            !formData.sport_id ||
                            t.sport_id === parseInt(formData.sport_id)
                        )
                        .map((tournament) => (
                          <option
                            key={tournament.tournament_id}
                            value={tournament.tournament_id}
                          >
                            {tournament.tournament_name}
                          </option>
                        ))}
                    </select>
                    {formData.tournament_id &&
                      tournaments.find(
                        (t) =>
                          t.tournament_id.toString() === formData.tournament_id
                      )?.tournament_icon && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <img
                            src={
                              tournaments.find(
                                (t) =>
                                  t.tournament_id.toString() ===
                                  formData.tournament_id
                              )?.tournament_icon
                            }
                            alt="Tournament"
                            className="w-6 h-6 object-contain"
                          />
                          <span>
                            {
                              tournaments.find(
                                (t) =>
                                  t.tournament_id.toString() ===
                                  formData.tournament_id
                              )?.tournament_name
                            }
                          </span>
                        </div>
                      )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      ĐỘI BÓNG
                    </label>
                    <select
                      name="team_id"
                      value={formData.team_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                      disabled={!formData.tournament_id}
                    >
                      <option value="">Chọn đội bóng</option>
                      {teams
                        .filter(
                          (t) =>
                            !formData.tournament_id ||
                            t.tournament_id === parseInt(formData.tournament_id)
                        )
                        .map((team) => (
                          <option key={team.team_id} value={team.team_id}>
                            {team.team_name}
                          </option>
                        ))}
                    </select>
                    {formData.team_id &&
                      teams.find(
                        (t) => t.team_id.toString() === formData.team_id
                      )?.team_logo && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <img
                            src={
                              teams.find(
                                (t) => t.team_id.toString() === formData.team_id
                              )?.team_logo
                            }
                            alt="Team"
                            className="w-6 h-6 object-contain"
                          />
                          <span>
                            {
                              teams.find(
                                (t) => t.team_id.toString() === formData.team_id
                              )?.team_name
                            }
                          </span>
                        </div>
                      )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      DANH MỤC *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 bg-white"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      NHÀ CUNG CẤP *
                    </label>
                    <select
                      name="supplier_id"
                      value={formData.supplier_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 bg-white"
                      required
                    >
                      <option value="">Chọn nhà cung cấp</option>
                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.supplier_id}
                          value={supplier.supplier_id}
                        >
                          {supplier.supplier_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-6 border-t pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  BIẾN THỂ SẢN PHẨM
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Nhập ít nhất một trong hai: kích cỡ hoặc màu sắc (hoặc cả
                  hai). Để trống nếu sản phẩm không có biến thể.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                disabled={loadingVariants}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">Thêm biến thể</span>
              </button>
            </div>

            {loadingVariants ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                <p className="text-xs text-gray-400 mt-2">
                  Đang tải variants...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {variants
                  .filter((v) => !v.isDeleted)
                  .map((variant, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-5 transition-colors duration-200 ${
                        variant.isNew
                          ? "bg-green-50 hover:bg-green-100"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          KÍCH CỠ{" "}
                          <span className="text-gray-400 font-normal normal-case">
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
                          className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-black focus:outline-none transition-colors duration-200"
                          placeholder="S, M, L, XL..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          MÀU SẮC{" "}
                          <span className="text-gray-400 font-normal normal-case">
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
                          className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-black focus:outline-none transition-colors duration-200"
                          placeholder="Đỏ, Xanh, Vàng..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                          TỒN KHO
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.variant_stock || 0}
                          disabled
                          className="w-full px-3 py-2 border-b-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Quản lý tại module kho
                        </p>
                      </div>

                      <div className="flex items-end justify-between">
                        {variant.isNew && (
                          <span className="px-2 py-1 text-xs bg-green-200 text-green-800 font-bold uppercase tracking-wider self-center">
                            MỚI
                          </span>
                        )}
                        {!variant.isNew && variant.variant_id && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 font-bold uppercase tracking-wider self-center">
                            ID: {variant.variant_id}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="px-3 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 transition-all duration-200 ml-auto"
                          title="Xóa variant"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {variants.filter((v) => !v.isDeleted).length === 0 &&
              !loadingVariants && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Chưa có biến thể. Nhấn "Thêm biến thể" để tạo mới.
                </div>
              )}
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang cập nhật...
                </span>
              ) : (
                "Cập nhật sản phẩm"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;
