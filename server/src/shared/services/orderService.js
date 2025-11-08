import db from "../../shared/models/index.js";

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

const getAllOrders = async () => {
  try {
    const orders = await db.Order.findAll({
      include: [
        {
          model: db.User,
          attributes: ["user_id", "user_name", "user_email"],
        },
      ],
      order: [["order_date", "DESC"]],
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
      return { success: false, message: "No orders found" };
    }
    return { success: true, data: orderDetails };
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    return { success: false, message: "Error fetching orders" };
  }
};
const getOrderHistoryByUserId = async (user_id) => {
  if (!user_id) {
    return { success: false, message: "Missing user_id" };
  }
  const orders = await db.Order.findAll({
    where: {
      user_id: user_id,
      order_status: [
        "Chờ xác nhận",
        "Đang vận chuyển",
        "Đã giao",
        "Đã hủy",
        "Đang xử lý",
      ],
    },
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

const approveOrder = async (order_id, status) => {
  try {
    if (!order_id) {
      return { success: false, message: "Missing order_id" };
    }
    if (!status) {
      return { success: false, message: "Missing status" };
    }
    const order = await db.Order.findOne({ where: { order_id } });
    if (!order) {
      return { success: false, message: "Order not found" };
    }
    order.order_status = status;
    await order.save();
    return {
      success: true,
      message: "Order status updated successfully",
      data: order,
    };
  } catch (err) {
    console.error("Error in approveOrder:", err);
    return { success: false, message: "Error updating order status" };
  }
};
export {
  createOrder,
  createOrderProduct,
  getStatusOrder,
  getOrderHistoryByUserId,
  getAllOrders,
  approveOrder,
};
