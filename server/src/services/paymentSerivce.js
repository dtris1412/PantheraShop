import axios from "axios";
import crypto from "crypto";
import { momoConfig } from "../config/momoConfig.js";

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

export { createMomoPayment };
