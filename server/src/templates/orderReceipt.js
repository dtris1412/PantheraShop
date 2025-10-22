export function renderOrderReceipt(order) {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 15px; background: #fff; color: #111; padding: 32px;">
      <h2 style="color:#000; text-align:center; font-size: 22px; margin-bottom: 24px; letter-spacing:1px;">
        <span style="border-bottom:2px solid #000; padding-bottom:4px;">BIÊN LAI ĐƠN HÀNG #${
          order.order_id
        }</span>
      </h2>
      <table style="width:100%; margin-bottom: 18px;">
        <tr>
          <td><b>Khách hàng:</b></td>
          <td>${order.recipient_name}</td>
        </tr>
        <tr>
          <td><b>Địa chỉ:</b></td>
          <td>${order.recipient_address}</td>
        </tr>
        <tr>
          <td><b>Số điện thoại:</b></td>
          <td>${order.recipient_phone}</td>
        </tr>
      </table>
      <table style="width:100%; border-collapse:collapse; background:#fff; border:1px solid #222;">
        <thead>
          <tr style="background:#222; color:#fff;">
            <th style="padding:10px; border:1px solid #222;">Sản phẩm</th>
            <th style="padding:10px; border:1px solid #222;">Số lượng</th>
            <th style="padding:10px; border:1px solid #222;">Đơn giá</th>
            <th style="padding:10px; border:1px solid #222;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${
            Array.isArray(order.products)
              ? order.products
                  .map(
                    (item) => `
                <tr style="text-align:center;">
                  <td style="padding:8px 6px; border:1px solid #222;">${
                    item.name || "Sản phẩm #" + item.variant_id
                  }</td>
                  <td style="padding:8px 6px; border:1px solid #222;">${
                    item.quantity
                  }</td>
                  <td style="padding:8px 6px; border:1px solid #222;">${Number(
                    item.price_at_time
                  ).toLocaleString()}đ</td>
                  <td style="padding:8px 6px; border:1px solid #222;"><b>${(
                    item.quantity * item.price_at_time
                  ).toLocaleString()}đ</b></td>
                </tr>
              `
                  )
                  .join("")
              : `<tr><td colspan="4" style="text-align:center;">Không có sản phẩm</td></tr>`
          }
        </tbody>
      </table>
      <div style="text-align:right; margin-top:18px;">
        <span style="font-size:17px; color:#000; font-weight:bold; border-bottom:2px solid #000; padding-bottom:2px;">
          Tổng cộng: ${order.total_amount.toLocaleString()}đ
        </span>
      </div>
      <hr style="margin:24px 0; border: none; border-top: 1px solid #222;">
      <div style="text-align:center; color:#000;">
        <b>Cảm ơn bạn đã mua hàng tại PantheraShop!</b>
      </div>
    </div>
  `;
}
