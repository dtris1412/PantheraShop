import {
  createOrder as createOrderService,
  createOrderProduct as createOrderProductService,
  getStatusOrder as getStatusOrderService,
} from "../services/orderService.js";

const createOrder = async (req, res) => {
  try {
    console.log("==> [createOrder] req.body:", req.body); // Log đầu vào

    const {
      order_id,
      order_date,
      order_status,
      total_amount,
      user_id,
      voucher_id,
      products,
      recipient_name,
      recipient_phone,
      recipient_address,
      notes,
    } = req.body;

    const orderResult = await createOrderService(
      order_id,
      order_date,
      order_status || "paid",
      total_amount,
      user_id,
      voucher_id,
      recipient_name,
      recipient_phone,
      recipient_address,
      notes
    );
    console.log("==> [createOrder] orderResult:", orderResult); // Log kết quả tạo order

    if (!orderResult.success) {
      console.error("==> [createOrder] orderResult error:", orderResult);
      return res.status(400).json(orderResult);
    }

    for (const product of products) {
      const { variant_id, quantity, price_at_time } = product;
      const orderProductResult = await createOrderProductService(
        orderResult.data.order_id,
        variant_id,
        quantity,
        price_at_time
      );
      console.log("==> [createOrder] orderProductResult:", orderProductResult); // Log từng sản phẩm

      if (!orderProductResult.success) {
        console.error(
          "==> [createOrder] orderProductResult error:",
          orderProductResult
        );
        return res.status(400).json(orderProductResult);
      }
    }
    res.status(201).json({ success: true, data: orderResult.data });
  } catch (err) {
    console.error("==> [createOrder] Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getStatusOrder = async (req, res) => {
  try {
    console.log("==> [getStatusOrder] order_id:", req.params.order_id); // Log đầu vào
    const statusResult = await getStatusOrderService(req.params.order_id);
    console.log("==> [getStatusOrder] statusResult:", statusResult); // Log kết quả

    if (!statusResult.success) {
      console.error("==> [getStatusOrder] statusResult error:", statusResult);
      return res.status(400).json(statusResult);
    }

    res.status(200).json(statusResult);
  } catch (err) {
    console.error("==> [getStatusOrder] Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { createOrder, getStatusOrder };
