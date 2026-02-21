export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).send("Arena X API - POST Only");
  }

  try {

    const { uid, amount } = req.body;

    if (!uid || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing uid or amount"
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum ₹100 required"
      });
    }

    const orderId = "ORD_" + Date.now();

    // 🔐 Zap Keys
    const ZAP_TOKEN = "add869238024e2008b309519c0d8d263";
    const ZAP_SECRET = "d9f7546f11140e3b652e459e2ee1a366";

    // 🌐 Replace with your real Vercel domain
    const BASE_URL = "https://yourdomain.vercel.app";

    const payload = new URLSearchParams();
    payload.append("token_key", ZAP_TOKEN);
    payload.append("secret_key", ZAP_SECRET);
    payload.append("amount", amount);
    payload.append("order_id", orderId);
    payload.append("customer_mobile", "9999999999");
    payload.append("redirect_url", BASE_URL + "/success.html");
    payload.append("fail_url", BASE_URL + "/failed.html");
    payload.append("webhook_url", BASE_URL + "/api/webhook");

    const response = await fetch("https://zapupi.com/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: "Zap API error",
        error: data
      });
    }

    // ⚡ Zap success response check
    if (data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment creation failed",
        error: data
      });
    }

    return res.status(200).json({
      success: true,
      paymentUrl: data.data.payment_url,
      order_id: orderId
    });

  } catch (error) {

    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
          }
