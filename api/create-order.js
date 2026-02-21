export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).send("Arena X API Working");
  }

  try {

    const { uid, amount } = req.body;

    if (!uid || !amount) {
      return res.status(400).json({
        status: "error",
        message: "uid or amount missing"
      });
    }

    if (amount < 1) {
  return res.status(400).json({
    status: "error",
    message: "Minimum ₹1 required"
  });
    }

    const orderId = Date.now().toString();

    const BASE_URL = "https://zap-backend-mu.vercel.app";

    const payload = new URLSearchParams();
    payload.append("token_key", "add869238024e2008b309519c0d8d263");
    payload.append("secret_key", "d9f7546f11140e3b652e459e2ee1a366");
    payload.append("amount", amount);
    payload.append("order_id", orderId);
    payload.append("customer_mobile", "9999999999");
    payload.append("redirect_url", BASE_URL + "/success.html");
    payload.append("remark", "ArenaX Add Cash");

    const response = await fetch("https://zapupi.com/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload
    });

    const data = await response.json();

    console.log("Zap Response:", data);

    if (response.ok && data.status === "success") {

      return res.status(200).json({
        status: "success",
        paymentUrl: data.payment_url,
        order_id: orderId
      });

    } else {

      return res.status(400).json({
        status: "error",
        message: data.message || "Payment creation failed",
        zap_response: data
      });

    }

  } catch (error) {

    return res.status(500).json({
      status: "error",
      message: error.message
    });

  }
}
