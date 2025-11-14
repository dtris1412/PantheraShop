export const momoConfig = {
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  partnerCode: "MOMOBKUN20180529",
  accessKey: "klm05TvNBzhg7h7j",
  secretKey: "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  redirectUrl:
    process.env.NODE_ENV === "production"
      ? "https://pantherashop.onrender.com/cart"
      : "http://localhost:3000/cart",
  ipnUrl:
    process.env.NODE_ENV === "production"
      ? "https://pantherashop.onrender.com/api/payment/momo/ipn"
      : "http://localhost:8080/api/payment/momo/ipn",
};

// export const paypalConfig = {
//   clientId: "YOUR_PAYPAL_CLIENT_ID",
//   secret: "YOUR_PAYPAL_SECRET",
//   apiUrl: "https://api-m.sandbox.paypal.com",
//   // ...các thông số khác...
// };

// Thêm các cổng khác nếu cần
