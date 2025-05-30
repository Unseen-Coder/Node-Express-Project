const nodemailer = require("nodemailer");

async function sendOTPEmail(email, otp){
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "USER_EMAIL",
      pass: "PASS",
    },
  });
  await transporter.sendMail({
    from: '"YourApp" <EMAIL_FROM>',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};

module.exports={
  sendOTPEmail
}