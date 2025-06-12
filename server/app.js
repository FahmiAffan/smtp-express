const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 3, // max 3 request per menit per IP
  message: {
    message: "Terlalu banyak percobaan. Coba lagi nanti.",
  },
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/send-email", limiter, async (req, res) => {
  const { from, subject, message } = req.body;

  if (!from || !subject || !message) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    const info = await transporter.sendMail({
      from: from,
      to: process.env.SMTP_USER,
      subject: subject,
      text: `dari ${from}\n\n${message}`,
      html: `<p>dari <strong>${from}</strong></p><p>${message}</p>`,
    });

    res.json({ message: "Email terkirim", id: info.messageId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengirim email" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(4000, () => {
  try {
    console.log("SMTP server listening on http://localhost:5000");
  } catch (error) {
    console.log(error);
  }
});
