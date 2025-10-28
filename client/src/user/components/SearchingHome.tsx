import { useState, useRef, useEffect } from "react";
import { useProduct } from "../../shared/contexts/productContext.tsx";

export default function SearchProduct({
  products,
  onSelect,
}: {
  products: any[];
  onSelect: (product: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lọc sản phẩm theo tên khi gõ
  const suggestions = query
    ? products.filter((p) =>
        p.product_name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative w-full max-w-md mb-6">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full border rounded px-4 py-2 focus:outline-none focus:border-black pr-10"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        {query && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            onClick={() => {
              setQuery("");
              setShowDropdown(false);
            }}
            tabIndex={-1}
            type="button"
            aria-label="Xóa tìm kiếm"
          >
            &#10005;
          </button>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-20 w-full bg-white border rounded shadow mt-1 max-h-64 overflow-y-auto">
          {suggestions.map((product) => (
            <div
              key={product.product_id}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onSelect(product);
                setQuery(product.product_name);
                setShowDropdown(false);
              }}
            >
              <img
                src={product.product_image}
                alt={product.product_name}
                className="w-10 h-10 object-cover rounded mr-3"
              />
              <div>
                <div>{product.product_name}</div>
                <div className="text-sm text-gray-500 font-semibold">
                  {product.product_price?.toLocaleString("vi-VN")} ₫
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
