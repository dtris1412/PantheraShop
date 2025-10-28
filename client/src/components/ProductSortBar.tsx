export default function ProductSortBar({
  selectedSort,
  setSelectedSort,
}: {
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
}) {
  return (
    <div className="flex items-center space-x-2 mb-8">
      <span className="text-sm text-gray-600">Lọc theo:</span>
      <select
        value={selectedSort}
        onChange={(e) => setSelectedSort(e.target.value)}
        className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-black"
      >
        <option value="featured">Mặc định</option>
        <option value="price-low">Giá: Thấp đến Cao</option>
        <option value="price-high">Giá: Cao đến Thấp</option>
        <option value="newest">Mới Nhất</option>
      </select>
    </div>
  );
}
