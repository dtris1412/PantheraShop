import axios from "axios";
import crypto from "crypto";
import { momoConfig } from "../config/momoConfig.js";
import { vnpayConfig } from "../config/vnpayConfig.js";
import qs from "qs";
import dateFormat from "dateformat";
import db from "../models/index.js";
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
  const { orderId, resultCode, payType } = ipnData;
  const status = resultCode === 0 ? "paid" : "failed";

  // 1. Tạo Order nếu chưa có
  let order = await db.Order.findOne({ where: { order_id: orderId } });
  if (!order && tempOrderData) {
    await createOrder(
      orderId,
      tempOrderData.order_date,
      status,
      tempOrderData.total_amount,
      tempOrderData.user_id,
      tempOrderData.voucher_id
    );
    // 2. Tạo OrderProduct cho từng sản phẩm
    for (const product of tempOrderData.products) {
      await createOrderProduct(
        orderId,
        tempOrderData.user_id,
        product.variant_id,
        product.quantity,
        product.price_at_time,
        tempOrderData.voucher_id
      );
    }
  }

  // 3. Cập nhật hoặc tạo Payment
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
      user_id: tempOrderData.user_id,
      voucher_id: tempOrderData.voucher_id,
    });
  }
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

export {
  createMomoPayment,
  createPayment,
  createVnpayPayment,
  updatePaymentStatusByIpn,
  handleMomoIpn,
};
