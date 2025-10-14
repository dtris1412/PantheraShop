export default function ProductSortBar({
  selectedSort,
  setSelectedSort,
}: {
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
}) {
  return (
    <div className="flex items-center space-x-2 mb-8">
      <span className="text-sm text-gray-600">Sort by:</span>
      <select
        value={selectedSort}
        onChange={(e) => setSelectedSort(e.target.value)}
        className="border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-black"
      >
        <option value="featured">Featured</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}
