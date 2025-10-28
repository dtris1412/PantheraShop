import { useState } from "react";

export default function SearchProduct({
  setQuery,
}: {
  setQuery: (q: string) => void;
}) {
  const [input, setInput] = useState("");

  // Khi nhập, cập nhật input và gọi setQuery để lọc ngoài grid
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setQuery(e.target.value);
  };

  // Khi xóa input, reset filter ngoài grid
  const handleClear = () => {
    setInput("");
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-md mb-6">
      <div className="relative">
        <input
          type="text"
          className="w-full border rounded px-4 py-2 focus:outline-none focus:border-black pr-10"
          placeholder="Tìm kiếm sản phẩm..."
          value={input}
          onChange={handleInput}
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
    </div>
  );
}
