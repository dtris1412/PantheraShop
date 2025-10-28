import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../../shared/contexts/productContext.tsx";

interface Product {
  product_id: string | number;
  product_name: string;
  product_image: string;
  product_price: string | number;
}

interface HeaderSearchPopupProps {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}

const POPULAR_TERMS = [
  "Manchester City",
  "Giày",
  "Áo đấu",
  "Chelsea",
  "Nike",
  "Adidas",
  "Bóng rổ",
  "Bóng chuyển",
];

export default function HeaderSearchPopup({
  open,
  value,
  onChange,
  onClose,
}: HeaderSearchPopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { products } = useProduct(); // lấy mảng products đã fetch

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [open]);

  useEffect(() => {
    if (!value) {
      setResults([]);
      return;
    }
    setLoading(true);
    // Lọc trực tiếp trên mảng products
    const filtered = products.filter((p) =>
      p.product_name.toLowerCase().includes(value.toLowerCase())
    );
    setResults(filtered);
    setLoading(false);
  }, [value, products]);

  const handleProductClick = (productId: string | number) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  return (
    <div
      className={`fixed inset-0 z-[60] transition-all duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Overlay: click để tắt popup */}
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        style={{ zIndex: 1 }}
      />
      <div
        className={`absolute left-0 right-0 top-0 w-full h-[160px] bg-white shadow-lg border-b border-gray-200
          transition-transform duration-300 ease-in-out
          ${open ? "translate-y-0" : "-translate-y-8"}
        `}
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 2 }}
      >
        <div className="flex items-center px-8 pt-4 pb-2">
          {/* Logo bên trái */}
          <img
            src="/assets/img/logo/logo_PantheraShop.png"
            alt="Logo"
            className="w-10 h-10 mr-6"
          />
          {/* Thanh tìm kiếm ở giữa, thon gọn và ngắn hơn */}
          <div className="flex items-center flex-1 justify-center">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-[340px] max-w-full shadow-sm">
              <Search className="w-5 h-5 text-gray-500 mr-2" />
              <input
                ref={inputRef}
                id="search-popup-input"
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base placeholder-gray-500"
                autoFocus={open}
              />
            </div>
          </div>
          <button
            className="ml-6 text-base font-semibold text-black hover:text-gray-600 transition-colors"
            onClick={onClose}
          >
            X
          </button>
        </div>
        {/* Popular Search Terms */}
        <div className="px-8 pt-2">
          <div className="text-gray-700 font-medium mb-2 text-sm">
            Từ khóa phổ biến
          </div>
          <div className="flex flex-wrap gap-3 mb-2">
            {POPULAR_TERMS.map((term) => (
              <button
                key={term}
                className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-1.5 text-sm font-semibold text-gray-900 transition-colors"
                onClick={() => onChange(term)}
              >
                {term}
              </button>
            ))}
          </div>
          {/* Kết quả tìm kiếm */}
          {value && (
            <div className="bg-white rounded shadow mt-2 max-h-56 overflow-y-auto">
              {loading && (
                <div className="p-4 text-gray-500 text-sm">
                  Đang tìm kiếm...
                </div>
              )}
              {!loading && results.length === 0 && (
                <div className="p-4 text-gray-500 text-sm ">
                  Không tìm thấy sản phẩm phù hợp.
                </div>
              )}
              {!loading &&
                results.map((product) => (
                  <button
                    key={product.product_id}
                    className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    onClick={() => handleProductClick(product.product_id)}
                  >
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-10 h-10 object-cover rounded mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {product.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Number(product.product_price).toLocaleString()}₫
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
