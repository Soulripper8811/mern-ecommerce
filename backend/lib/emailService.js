import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
console.log(process.env.GMAIL_EMAIL)
console.log(process.env.GMAIL_PASSWORD)

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendMail = async (
  to,
  subject,
  buttonLink,
  buttonText,
  emailPurpose
) => {
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #007bff;
            color: #ffffff;
            text-align: center;
            padding: 10px;
            border-radius: 8px 8px 0 0;
          }
          .content {
            padding: 20px;
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 12px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            color: #777;
            font-size: 12px;
          }
        </style>
      </head>
      <body>

        <div class="container">
          <div class="header">
            <h2>${subject}</h2>
          </div>

          <div class="content">
            <p><strong>Purpose:</strong> ${emailPurpose}</p>
            <p>Click the button below to proceed:</p>

            <a href="${buttonLink}" class="button">${buttonText}</a>
          </div>

          <div class="footer">
            <p>If you didn't request this email, please ignore it.</p>
            <p>&copy; 2025 Your Company Name</p>
          </div>
        </div>

      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
