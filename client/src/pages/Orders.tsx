import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const navigate = useNavigate();

  const orders = [
    {
      id: "ORD-2025-001",
      date: "2025-10-05",
      status: "delivered",
      total: 329.97,
      items: [
        {
          name: "Air Max Performance Running Shoes",
          size: "US 10",
          color: "Black/White",
          image:
            "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
          quantity: 1,
          price: 149.99,
        },
        {
          name: "Pro Basketball Jersey",
          size: "L",
          color: "Blue",
          image:
            "https://images.pexels.com/photos/8007412/pexels-photo-8007412.jpeg?auto=compress&cs=tinysrgb&w=400",
          quantity: 2,
          price: 89.99,
        },
      ],
    },
    {
      id: "ORD-2025-002",
      date: "2025-10-08",
      status: "shipped",
      total: 199.99,
      items: [
        {
          name: "Professional Football Cleats",
          size: "US 9",
          color: "Red/Black",
          image:
            "https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=400",
          quantity: 1,
          price: 199.99,
        },
      ],
    },
    {
      id: "ORD-2025-003",
      date: "2025-10-09",
      status: "processing",
      total: 124.98,
      items: [
        {
          name: "Elite Training Shorts",
          size: "M",
          color: "Gray",
          image:
            "https://images.pexels.com/photos/7859406/pexels-photo-7859406.jpeg?auto=compress&cs=tinysrgb&w=400",
          quantity: 2,
          price: 39.99,
        },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-6">No orders yet</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-lg">{order.id}</span>
                      {getStatusIcon(order.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on{" "}
                      {new Date(order.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-4 py-1 text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <span className="font-bold text-lg">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover bg-gray-100"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Color: {item.color} | Qty:{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button className="flex-1 border-2 border-black text-black py-3 font-semibold hover:bg-gray-100 transition-colors">
                    Track Order
                  </button>
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
