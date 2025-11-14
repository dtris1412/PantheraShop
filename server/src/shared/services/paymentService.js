import axios from "axios";
import crypto from "crypto";
import { momoConfig } from "../../shared/config/momoConfig.js";
import { vnpayConfig } from "../../shared/config/vnpayConfig.js";
import qs from "qs";
import dateFormat from "dateformat";
import db from "../../shared/models/index.js";
import { createOrder, createOrderProduct } from "./orderService.js";

const createMomoPayment = async ({ amount, orderId, orderInfo }) => {
  const { endpoint, partnerCode, accessKey, secretKey, redirectUrl, ipnUrl } =
    momoConfig;

  const extraData = "";
  const requestId = Date.now().toString();
  const requestType = "captureWallet";

  const rawHash = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawHash)
    .digest("hex");

  const data = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: "vi",
  };

  const momoRes = await axios.post(endpoint, data, {
    headers: { "Content-Type": "application/json" },
  });
  return momoRes.data;
};

const createPayment = async ({
  payment_method,
  payment_status,
  payment_info,
  paid_at,
  order_id,
  user_id,
  voucher_id,
}) => {
  if (!payment_method || !payment_status || !payment_info || !order_id) {
    return { success: false, message: "Missing required fields" };
  }
  try {
    // GỌI model Sequelize, KHÔNG gọi lại createPayment!
    const payment = await db.Payment.create({
      payment_method,
      payment_status,
      payment_info,
      paid_at: paid_at ?? null,
      order_id,
      user_id,
      voucher_id,
    });
    return { success: true, data: payment };
  } catch (err) {
    console.error("==> [createPayment] Error:", err);
    return { success: false, message: err.message };
  }
};

const updatePaymentStatusByIpn = async (ipnData) => {
  const { orderId, resultCode, payType, transId, amount, extraData } = ipnData;

  // Xác định trạng thái thanh toán
  const status = resultCode === 0 ? "paid" : "failed";

  // Cập nhật hoặc tạo bản ghi Payment
  let payment = await db.Payment.findOne({ where: { order_id: orderId } });
  if (payment) {
    await payment.update({
      payment_status: status,
      paid_at: new Date(),
      payment_info: JSON.stringify(ipnData),
    });
  } else {
    await db.Payment.create({
      payment_method: payType || "momo",
      payment_status: status,
      paid_at: new Date(),
      payment_info: JSON.stringify(ipnData),
      order_id: orderId,
    });
  }
  return status;
};

const handleMomoIpn = async (ipnData, tempOrderData) => {
  const { orderId, resultCode, payType, transId, message } = ipnData;
  const status = resultCode === 0 ? "paid" : "failed";

  // Rút gọn payment_info để tránh vượt quá độ dài column
  const shortPaymentInfo = JSON.stringify({
    transId: transId,
    resultCode: resultCode,
    message: message,
    payType: payType,
  });

  // 1. Tìm order (phải tồn tại vì đã được tạo trước)
  let order = await db.Order.findOne({ where: { order_id: orderId } });

  if (!order) {
    console.error(`❌ Order ${orderId} not found in database`);
    throw new Error(`Order ${orderId} not found`);
  }

  console.log(
    `✅ Found order: ${orderId}, current status: ${order.order_status}`
  );

  // 2. Cập nhật trạng thái order
  if (order.order_status !== status) {
    await order.update({ order_status: status });
    console.log(`📝 Updated order status: ${order.order_status} -> ${status}`);
  }

  // 3. Cập nhật hoặc tạo Payment
  let payment = await db.Payment.findOne({ where: { order_id: orderId } });
  if (payment) {
    console.log(`📝 Updating existing payment for order: ${orderId}`);
    await payment.update({
      payment_status: status,
      paid_at: new Date(),
      payment_info: shortPaymentInfo,
    });
  } else {
    console.log(`📝 Creating new payment for order: ${orderId}`);
    await db.Payment.create({
      payment_method: payType || "momo",
      payment_status: status,
      paid_at: new Date(),
      payment_info: shortPaymentInfo,
      order_id: orderId,
      user_id: order.user_id,
      voucher_id: order.voucher_id,
    });
  }

  console.log(
    `✅ Payment processed successfully for order: ${orderId}, status: ${status}`
  );
  return status;
};

const createVnpayPayment = ({ amount, orderId, orderInfo }) => {
  const date = new Date();
  const createDate = dateFormat(date, "yyyymmddHHmmss");
  const vnp_Params = {
    vnp_Version: vnpayConfig.vnp_Version,
    vnp_Command: vnpayConfig.vnp_Command,
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: vnpayConfig.vnp_CurrCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: createDate,
  };

  // Sắp xếp tham số
  const sorted = Object.keys(vnp_Params)
    .sort()
    .reduce((r, k) => ((r[k] = vnp_Params[k]), r), {});
  const signData = qs.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  sorted.vnp_SecureHash = signed;

  return `${vnpayConfig.vnp_Url}?${qs.stringify(sorted, { encode: false })}`;
};

const getMethodByOrderId = async (order_id) => {
  try {
    const payment = await db.Payment.findOne({ where: { order_id } });
    if (!payment) {
      return { success: false, message: "Payment not found" };
    }
    return { success: true, payment };
  } catch (err) {
    console.error("==> [getStatusByOrderId] Error:", err);
    return { success: false, message: err.message };
  }
};
export {
  createMomoPayment,
  createPayment,
  createVnpayPayment,
  updatePaymentStatusByIpn,
  handleMomoIpn,
  getMethodByOrderId,
};
