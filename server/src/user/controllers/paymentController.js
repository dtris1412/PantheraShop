import {
  createMomoPayment,
  createPayment as createPaymentService,
  handleMomoIpn,
  createVnpayPayment,
} from "../../shared/services/paymentService.js";

// In-memory cache for temporary order data (before payment confirmation)
// In production, consider using Redis or similar solution
const tempOrderCache = new Map();

const createMomoPaymentController = async (req, res) => {
  try {
    console.log("========== CREATE MOMO PAYMENT ==========");
    console.log("req.body:", JSON.stringify(req.body, null, 2));

    const { amount, orderId, orderInfo, orderData } = req.body;
    if (!amount || !orderId || !orderInfo) {
      console.error("❌ Missing basic payment data");
      return res
        .status(400)
        .json({ message: "Thiếu thông tin cơ bản thanh toán!" });
    }

    if (!orderData) {
      console.error("❌ Missing orderData");
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng!" });
    }

    // user_id có thể null (guest user), không bắt buộc

    if (!orderData.products || orderData.products.length === 0) {
      console.error("❌ Missing or empty products array");
      return res.status(400).json({ message: "Giỏ hàng trống!" });
    }

    // Import service để tạo order
    const { createOrder: createOrderService, createOrderProduct } =
      await import("../../shared/services/orderService.js");

    // Tạo order với status "pending" TRƯỚC khi gọi MoMo API
    try {
      // Tạo order với đầy đủ thông tin như COD
      await createOrderService(
        orderId,
        orderData.order_date,
        "pending",
        orderData.total_amount,
        orderData.user_id,
        orderData.voucher_id,
        orderData.recipient_name,
        orderData.recipient_phone,
        orderData.recipient_address,
        orderData.notes
      );

      // Tạo OrderProduct cho từng sản phẩm
      for (const product of orderData.products) {
        await createOrderProduct(
          orderId,
          product.variant_id,
          product.quantity,
          product.price_at_time
        );
      }

      console.log(`✅ Created order with status "pending": ${orderId}`);
    } catch (orderErr) {
      console.error("Error creating order:", orderErr);
      return res.status(500).json({
        message: "Không thể tạo đơn hàng!",
        error: orderErr.message,
      });
    }

    // Gọi MoMo API để tạo payment
    const result = await createMomoPayment({ amount, orderId, orderInfo });
    console.log("MOMO API response:", result);
    res.json(result);
  } catch (err) {
    console.error("MOMO API error:", err?.response?.data || err.message || err);
    res.status(500).json({
      message: "Lỗi khi tạo thanh toán MoMo.",
      error: err?.response?.data || err.message,
    });
  }
};

const createPayment = async (req, res) => {
  try {
    const {
      payment_method,
      payment_status,
      payment_info,
      paid_at,
      order_id,
      user_id,
      voucher_id,
    } = req.body;

    const paymentResult = await createPaymentService({
      payment_method,
      payment_status,
      payment_info,
      paid_at,
      order_id,
      user_id,
      voucher_id,
    });

    if (paymentResult.success) {
      res.json(paymentResult.data);
    } else {
      res.status(400).json({ success: false, message: paymentResult.message });
    }
  } catch (err) {
    console.error("Error creating payment: ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Helper function to get temp order data from cache
const getTempOrderData = (orderId) => {
  const data = tempOrderCache.get(orderId);
  if (data) {
    console.log(`✅ Found temp order data for orderId: ${orderId}`);
    // Clean up old entries (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (data.createdAt < oneHourAgo) {
      tempOrderCache.delete(orderId);
      console.log(`🗑️  Cleaned up old temp order data for orderId: ${orderId}`);
      return null;
    }
    return data;
  }
  console.log(`⚠️  No temp order data found for orderId: ${orderId}`);
  return null;
};

const momoIpnHandler = async (req, res) => {
  try {
    console.log("========== MOMO IPN RECEIVED ==========");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("=======================================");

    const ipnData = req.body;

    // Không cần tempOrderData nữa vì order đã được tạo sẵn
    const status = await handleMomoIpn(ipnData, null);

    console.log("✅ IPN handled successfully, status:", status);
    res.status(200).json({ message: "IPN received", status });
  } catch (err) {
    console.error("❌ MoMo IPN error:", err);
    res.status(500).json({ message: "IPN error", error: err.message });
  }
};

const createVnpayPaymentController = async (req, res) => {
  try {
    const { amount, orderId, orderInfo } = req.body;
    if (!amount || !orderId || !orderInfo) {
      return res.status(400).json({ message: "Thiếu dữ liệu thanh toán!" });
    }
    const payUrl = await createVnpayPayment({ amount, orderId, orderInfo });
    res.json({ payUrl });
  } catch (err) {
    console.error(
      "VNPAY API error:",
      err?.response?.data || err.message || err
    );
    res.status(500).json({
      message: "Lỗi khi tạo thanh toán VNPAY.",
      error: err?.response?.data || err.message,
    });
  }
};

export {
  createMomoPaymentController as createMomoPayment,
  createPayment,
  momoIpnHandler,
  createVnpayPaymentController,
};
