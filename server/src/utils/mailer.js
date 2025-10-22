import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "daohuutri04@gmail.com",
    pass: "xtsgjtfyokgpmkca",
  },
});

export const sendOrderMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: '"PantheraShop" <daohuutri04@gmail.com>',
    to,
    subject,
    html,
  });
};
