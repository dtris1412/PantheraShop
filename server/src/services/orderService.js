import db from "../models/index.js";

const createOrder = async (
  order_id,
  order_date,
  order_status,
  total_amount,
  user_id,
  voucher_id
) => {
  if (!order_id || !order_date || !order_status || !total_amount || !user_id) {
    return { success: false, message: "Missing required fields" };
  }
  const newOrder = await db.Order.create({
    order_id,
    order_date,
    order_status,
    total_amount,
    user_id,
    voucher_id,
  });
  return { success: true, data: newOrder };
};

const createOrderProduct = async (
  order_id,
  user_id,
  variant_id,
  quantity,
  price_at_time,
  voucher_id
) => {
  if (!order_id || !user_id || !variant_id || !quantity || !price_at_time) {
    return { success: false, message: "Missing required fields" };
  }
  const newOrderProduct = await db.OrderProduct.create({
    order_id,
    user_id,
    variant_id,
    quantity,
    price_at_time,
    voucher_id,
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

export { createOrder, createOrderProduct, getStatusOrder };
