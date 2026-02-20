import fetch from "node-fetch";

const ZAP_TOKEN = "add869238024e2008b309519c0d8d263";
const ZAP_SECRET = "d9f7546f11140e3b652e459e2ee1a366";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const { amount, uid } = req.body;

    if (!amount || !uid) {
      return res.status(400).json({ message: "Missing data" });
    }

    const orderId = "ORD_" + Date.now();

    const payload = new URLSearchParams();
    payload.append("token_key", ZAP_TOKEN);
    payload.append("secret_key", ZAP_SECRET);
    payload.append("amount", amount);
    payload.append("order_id", orderId);
    payload.append("redirect_url", "https://yourdomain.vercel.app/payment-success");

    const zapRes = await fetch("https://zapupi.com/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload
    });

    const zapData = await zapRes.json();

    if (zapData.status === "success") {
      return res.status(200).json({
        success: true,
        payment_url: zapData.payment_url,
        order_id: orderId
      });
    } else {
      return res.status(400).json({ success: false });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
      }
