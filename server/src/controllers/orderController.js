import {
  createOrder as createOrderService,
  createOrderProduct as createOrderProductService,
  getStatusOrder as getStatusOrderService,
} from "../services/orderService.js";

const createOrder = async (req, res) => {
  try {
    const {
      order_id,
      order_date,
      order_status,
      total_amount,
      user_id,
      voucher_id,
      products,
    } = req.body;

    // Create the main order
    const orderResult = await createOrderService(
      order_id,
      order_date,
      order_status || "paid",
      total_amount,
      user_id,
      voucher_id
    );
    if (!orderResult.success) {
      return res.status(400).json(orderResult);
    }
    // Create order products
    for (const product of products) {
      const { variant_id, quantity, price_at_time } = product;
      const orderProductResult = await createOrderProductService(
        orderResult.data.id,
        user_id,
        variant_id,
        quantity,
        price_at_time,
        voucher_id
      );
      if (!orderProductResult.success) {
        return res.status(400).json(orderProductResult);
      }
    }
    res.status(201).json({ success: true, data: orderResult.data });
  } catch (err) {
    console.error("Error creating order: ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getStatusOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const statusResult = await getStatusOrderService(order_id);
    if (!statusResult.success) {
      return res.status(400).json(statusResult);
    }

    res.status(200).json(statusResult);
  } catch (err) {
    console.error("Error getting order status: ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export { createOrder, getStatusOrder };
