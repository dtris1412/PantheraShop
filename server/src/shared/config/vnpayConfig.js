export const vnpayConfig = {
  vnp_TmnCode: "U3UZJ07Y",
  vnp_HashSecret: "EPTGLU7JTII85ICAQE2JXDN46ZZ75B6V",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl:
    process.env.NODE_ENV === "production"
      ? "https://pantherashop.onrender.com/cart"
      : "http://localhost:3000/cart",
  vnp_Version: "2.1.0",
  vnp_Command: "pay",
  vnp_CurrCode: "VND",
};
