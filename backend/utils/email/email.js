const nodemailer = require("nodemailer");
const asyncHandler = require("../asyncHandler/asyncHandler");

const Email = async (userOptions) => {
  let transporter;

  if (process.env.NODE_ENV === "development") {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: "SENDGRID",
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: userOptions.email,
    subject: userOptions.subject,
    text: userOptions.message,
  };

  return await transporter.sendMail(message);
};

module.exports = {
  Email,
};
