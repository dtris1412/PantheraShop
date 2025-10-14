import { useState, useRef, useEffect } from "react";

export default function SearchProduct({
  products,
  onSelect,
  setQuery,
}: {
  products: any[];
  onSelect: (product: any) => void;
  setQuery: (q: string) => void;
}) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lọc sản phẩm theo tên khi gõ
  const filteredProducts = input
    ? products.filter((p) =>
        p.product_name.toLowerCase().includes(input.toLowerCase())
      )
    : products;

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

  // Khi nhập, cập nhật input và gọi setQuery để lọc ngoài grid
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowDropdown(true);
    setQuery(e.target.value);
  };

  // Khi xóa input, reset filter ngoài grid
  const handleClear = () => {
    setInput("");
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-md mb-6">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full border rounded px-4 py-2 focus:outline-none focus:border-black pr-10"
          placeholder="Tìm kiếm sản phẩm..."
          value={input}
          onChange={handleInput}
          onFocus={() => setShowDropdown(true)}
        />
        {input && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            onClick={handleClear}
            tabIndex={-1}
            type="button"
            aria-label="Xóa tìm kiếm"
          >
            &#10005;
          </button>
        )}
      </div>
      {showDropdown && input && filteredProducts.length > 0 && (
        <div className="absolute z-20 w-full bg-white border rounded shadow mt-1 max-h-64 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.product_id}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onSelect(product);
                setInput(product.product_name);
                setShowDropdown(false);
                setQuery(product.product_name);
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
