interface Product {
  product_image?: string | null;
  product_name?: string | null;
}

interface Variant {
  Product?: Product | null;
  variant_size?: string | null;
  variant_color?: string | null;
}

interface OrderItemType {
  variant_id: number;
  quantity: number;
  price_at_time: number | string;
  Variant?: {
    variant_id: number;
    variant_size: string;
    variant_color: string | null;
    product_id: number;
    Product?: {
      product_name: string;
      product_image: string;
      product_description: string;
      category_id: number;
      Category?: {
        category_name: string;
      };
    };
  };
}

interface OrderItemProps {
  item: OrderItemType;
}
function formatVND(value: number | string) {
  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function OrderItem({ item }: OrderItemProps) {
  const product = item.Variant?.Product;
  return (
    <div className="flex items-center mb-4 last:mb-0">
      <img
        src={product?.product_image}
        alt={product?.product_name}
        className="w-20 h-20 object-cover rounded mr-6 border"
      />
      <div className="flex-1">
        <div className="font-semibold text-lg">{product?.product_name}</div>
        <div className="text-gray-500 text-sm">
          Size: {item.Variant?.variant_size ?? "-"} | Color:{" "}
          {item.Variant?.variant_color ?? "-"} | Qty: {item.quantity}
        </div>
        <div className="text-xs text-gray-400">
          {product?.Category?.category_name} | {product?.product_description}
        </div>
      </div>
      <div className="font-bold text-lg ml-4">
        {formatVND(item.price_at_time)}
      </div>
    </div>
  );
}
