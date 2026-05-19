import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

const sendEmailOTP = async (email, otp) => {

  console.log("Sending OTP to:", email);

  try {

    const info = await transporter.sendMail({
      from: `"DevConnectAI" <${process.env.EMAIL}>`,
      to: email,
      subject: "Verify Your Email - DevConnectAI",

      html: `
      <!DOCTYPE html>
      <html lang="en">

      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OTP Verification</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background-color:#f4f7fb;
        font-family:Arial, Helvetica, sans-serif;
      ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding:40px 15px;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="
                  max-width:600px;
                  background:#ffffff;
                  border-radius:18px;
                  padding:40px;
                  box-shadow:0 4px 20px rgba(0,0,0,0.08);
                ">

                <!-- Brand -->
                <tr>
                  <td align="center">

                    <h1 style="
                      margin:0;
                      font-size:34px;
                      color:#111827;
                      font-weight:700;
                    ">
                      DevConnectAI
                    </h1>

                    <p style="
                      margin-top:8px;
                      color:#6b7280;
                      font-size:15px;
                    ">
                      Connect • Build • Grow
                    </p>

                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" style="padding-top:35px;">

                    <h2 style="
                      margin:0;
                      color:#111827;
                      font-size:28px;
                    ">
                      Email Verification
                    </h2>

                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td align="center" style="padding-top:18px;">

                    <p style="
                      margin:0;
                      color:#4b5563;
                      font-size:16px;
                      line-height:1.8;
                    ">
                      Welcome to DevConnectAI 🚀
                      <br /><br />
                      Use the OTP below to verify your email address.
                      This OTP will expire in
                      <strong>30 seconds</strong>.
                    </p>

                  </td>
                </tr>

                <!-- OTP BOX -->
                <tr>
                  <td align="center" style="padding:40px 0;">

                    <div style="
                      display:inline-block;
                      background:#111827;
                      color:#ffffff;
                      font-size:38px;
                      font-weight:bold;
                      letter-spacing:12px;
                      padding:20px 40px;
                      border-radius:14px;
                    ">
                      ${otp}
                    </div>

                  </td>
                </tr>

                <!-- Security Text -->
                <tr>
                  <td align="center">

                    <p style="
                      margin:0;
                      color:#ef4444;
                      font-size:14px;
                      font-weight:500;
                    ">
                      Never share this OTP with anyone.
                    </p>

                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-top:35px;">
                    <hr style="
                      border:none;
                      border-top:1px solid #e5e7eb;
                    ">
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding-top:25px;">

                    <p style="
                      margin:0;
                      color:#9ca3af;
                      font-size:13px;
                      line-height:1.7;
                    ">
                      If you did not request this email,
                      you can safely ignore it.
                    </p>

                    <p style="
                      margin-top:20px;
                      color:#6b7280;
                      font-size:13px;
                    ">
                      © 2026 DevConnectAI. All rights reserved.
                    </p>

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
      </html>
      `
    });

    console.log("Mail sent successfully:", info.response);

  } catch (error) {

    console.error("Email send error:", error.message);

    throw new Error("Failed to send OTP email");
  }
};

export { sendEmailOTP };