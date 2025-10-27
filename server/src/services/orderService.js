import db from "../models/index.js";

const createOrder = async (
  order_id,
  order_date,
  order_status,
  total_amount,
  user_id,
  voucher_id,
  recipient_name,
  recipient_phone,
  recipient_address,
  notes
) => {
  if (
    !order_id ||
    !order_date ||
    !order_status ||
    !total_amount ||
    !recipient_name ||
    !recipient_phone ||
    !recipient_address
  ) {
    return { success: false, message: "Missing required fields" };
  }
  const newOrder = await db.Order.create({
    order_id,
    order_date,
    order_status,
    total_amount,
    user_id,
    voucher_id,
    recipient_name,
    recipient_phone,
    recipient_address,
    notes,
  });
  return { success: true, data: newOrder };
};

const createOrderProduct = async (
  order_id,
  variant_id,
  quantity,
  price_at_time
) => {
  if (!order_id || !variant_id || !quantity || !price_at_time) {
    return { success: false, message: "Missing required fields" };
  }
  const newOrderProduct = await db.OrderProduct.create({
    order_id,
    variant_id,
    quantity,
    price_at_time,
  });
  return { success: true, data: newOrderProduct };
};

const getStatusOrder = async (order_id) => {
  if (!order_id) {
    return { success: false, message: "Missing order_id" };
  }
  const order = await db.Order.findOne({
    where: { order_id: order_id },
  });
  if (!order) {
    return { success: false, message: "Order not found" };
  }
  return { success: true, data: order };
};

const getOrderHistoryByUserId = async (user_id) => {
  if (!user_id) {
    return { success: false, message: "Missing user_id" };
  }
  const orders = await db.Order.findAll({
    where: { user_id: user_id, order_status: ["Delivered", "Cancelled"] },
  });
  const orderDetails = await Promise.all(
    orders.map(async (order) => {
      const orderProducts = await db.OrderProduct.findAll({
        where: { order_id: order.order_id },
        include: [
          {
            model: db.Variant,
            include: [
              {
                model: db.Product,
                attributes: [
                  "product_name",
                  "product_image",
                  "product_description",
                  "category_id",
                ],
                include: [
                  {
                    model: db.Category,
                    attributes: ["category_name"],
                  },
                ],
              },
            ],
          },
        ],
      });
      return { ...order.toJSON(), orderProducts };
    })
  );
  if (!orders || orders.length === 0) {
    return { success: false, message: "No orders found for this user" };
  }
  return { success: true, data: orderDetails };
};
export {
  createOrder,
  createOrderProduct,
  getStatusOrder,
  getOrderHistoryByUserId,
};
