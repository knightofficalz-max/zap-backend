export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).send("Arena X API - POST Only");
  }

  try {

    const { uid, amount } = req.body;

    if (!uid || !amount) {
      return res.status(400).json({
        error: "Missing uid or amount"
      });
    }

    const orderId = "ORD_" + Date.now();

    const payload = new URLSearchParams();
    payload.append("token_key", "add869238024e2008b309519c0d8d263");
    payload.append("secret_key", "d9f7546f11140e3b652e459e2ee1a366");
    payload.append("amount", amount);
    payload.append("order_id", orderId);
    payload.append("customer_mobile", "9999999999");
    payload.append("redirect_url", "https://zap-backend-mu.vercel.app/success.html");
    payload.append("webhook_url", "https://zap-backend-mu.vercel.app/api/webhook");

    const response = await fetch("https://zapupi.com/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload
    });

    const text = await response.text(); // 👈 JSON nahi, pehle text lo

    return res.status(200).json({
      zap_status: response.status,
      zap_raw_response: text
    });

  } catch (error) {

    return res.status(500).json({
      server_error: error.message
    });
  }
}
