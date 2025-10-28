import {
  createOrder as createOrderService,
  createOrderProduct as createOrderProductService,
  getStatusOrder as getStatusOrderService,
  getOrderHistoryByUserId as getOrderHistoryByUserIdService,
} from "../../shared/services/orderService.js";

import {
  removeItemFromCart as removeItemFromCartService,
  getCartByUserId as getCartByUserIdService,
} from "../../shared/services/cartService.js";

import { decreaseVoucherStock as decreaseVoucherStockService } from "../../shared/services/voucherService.js";

import { decreaseVariantStock as decreaseVariantStockService } from "../../shared/services/variantService.js";

import { sendOrderMail } from "../../shared/utils/mailer.js";
import { renderOrderReceipt } from "../../shared/templates/orderReceipt.js";

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
      shipping_fee,
      order_discount,
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
    await decreaseVoucherStockService(voucher_id);

    for (const product of products) {
      const { variant_id, quantity, price_at_time } = product;
      const orderProductResult = await createOrderProductService(
        orderResult.data.order_id,
        variant_id,
        quantity,
        price_at_time
      );
      console.log("==> [createOrder] orderProductResult:", orderProductResult); // Log từng sản phẩm
      await decreaseVariantStockService(variant_id, quantity);
      if (!orderProductResult.success) {
        console.error(
          "==> [createOrder] orderProductResult error:",
          orderProductResult
        );
        return res.status(400).json(orderProductResult);
      }
    }

    // Sau khi tạo đơn hàng thành công:
    const orderData = {
      ...orderResult.data.dataValues,
      products: req.body.products,
      shipping_fee: req.body.shipping_fee ?? 0,
      order_discount: req.body.order_discount ?? 0,
      total_amount:
        req.body.total_amount ?? orderResult.data.dataValues.total_amount,
    };
    const html = renderOrderReceipt(orderData);
    await sendOrderMail(req.body.recipient_email, "Biên lai đơn hàng", html);

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

const getOrderHistoryByUserId = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const historyResult = await getOrderHistoryByUserIdService(user_id);
    if (!historyResult.success) {
      console.error(
        "==> [getOrderHistoryByUserId] historyResult error:",
        historyResult
      );
      return res.status(400).json(historyResult);
    }
    res.status(200).json(historyResult);
  } catch (err) {
    console.error("Error in getOrderHistoryByUserId: ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export { createOrder, getStatusOrder, getOrderHistoryByUserId };
