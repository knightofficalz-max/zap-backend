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

    const BASE_URL = "https://zap-backend-mu.vercel.app"; // 🔁 apna domain confirm kar

    const payload = new URLSearchParams();
    payload.append("token_key", "add869238024e2008b309519c0d8d263");
    payload.append("secret_key", "d9f7546f11140e3b652e459e2ee1a366");
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

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON from Zap",
        raw_response: text
      });
    }

    // 🔎 Payment URL detection
    const paymentUrl =
      data.payment_url ||
      data.paymentUrl ||
      data.data?.payment_url ||
      data.data?.paymentUrl;

    if (!paymentUrl) {
      return res.status(400).json({
        success: false,
        message: "Payment URL not received from Zap",
        zap_response: data
      });
    }

    return res.status(200).json({
      success: true,
      paymentUrl: paymentUrl,
      order_id: orderId
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
}
