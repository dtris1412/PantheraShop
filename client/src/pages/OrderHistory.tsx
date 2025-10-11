import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrderHistory() {
  const navigate = useNavigate();

  // Giả lập dữ liệu đơn hàng
  const orders = [
    {
      id: "ORD-2025-001",
      date: "October 5, 2025",
      status: "Delivered",
      total: 329.97,
      currency: "$",
      items: [
        {
          image:
            "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/7b8e7e5c-2e7e-4e6c-8e2e-1e7e7e7e7e7e/air-max-shoe.png",
          name: "Air Max Performance Running Shoes",
          attrs: "Size: US 10 | Color: Black/White | Qty: 1",
          price: 149.99,
        },
        {
          image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80",
          name: "Pro Basketball Jersey",
          attrs: "Size: L | Color: Blue | Qty: 2",
          price: 89.99,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Order History</h1>
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-gray-50 border-b">
                <div>
                  <span className="font-bold text-xl mr-2">{order.id}</span>
                  <CheckCircle className="inline-block text-green-600 w-5 h-5 align-middle" />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-green-100 text-green-700 px-4 py-1 rounded font-semibold text-sm">
                    {order.status}
                  </span>
                  <span className="text-2xl font-bold">
                    {order.currency}
                    {order.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              <div className="px-6 pt-2 pb-4 text-gray-500 text-sm border-b">
                Placed on {order.date}
              </div>
              {/* Items */}
              <div className="px-6 py-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center mb-4 last:mb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded mr-6 border"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{item.name}</div>
                      <div className="text-gray-500 text-sm">{item.attrs}</div>
                    </div>
                    <div className="font-bold text-lg ml-4">
                      {order.currency}
                      {item.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 px-6 pb-6">
                <button className="flex-1 border border-black py-3 font-semibold hover:bg-gray-100 transition">
                  Track Order
                </button>
                <button className="flex-1 border border-gray-300 py-3 font-semibold hover:bg-gray-100 transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          className="mt-8 px-4 py-2 bg-black text-white rounded"
          onClick={() => navigate("/profile")}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}
