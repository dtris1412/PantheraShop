import { useNavigate } from "react-router-dom";

export default function Products() {
  const navigate = useNavigate();

  const products = [
    { id: "1", name: "Air Max Performance Running Shoes", price: 149.99 },
    { id: "2", name: "Nike Zoom Fly 5", price: 129.99 },
  ];

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="border p-4 rounded-lg cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate(`/product/${product.id}`)} // ✅ điều hướng bằng route
        >
          <h2 className="font-bold text-xl mb-2">{product.name}</h2>
          <p className="text-gray-600">${product.price}</p>
        </div>
      ))}
    </div>
  );
}
