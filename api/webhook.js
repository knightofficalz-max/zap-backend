import admin from "firebase-admin";
import fetch from "node-fetch";

const ZAP_TOKEN = "add869238024e2008b309519c0d8d263";
const ZAP_SECRET = "d9f7546f11140e3b652e459e2ee1a366";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  });
}

const db = admin.database();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: "Order ID missing" });
    }

    const payload = new URLSearchParams();
    payload.append("token_key", ZAP_TOKEN);
    payload.append("secret_key", ZAP_SECRET);
    payload.append("order_id", order_id);

    const verifyRes = await fetch("https://zapupi.com/api/order-status", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload
    });

    const verifyData = await verifyRes.json();

    if (verifyData.status === "success" && verifyData.data.status === "Success") {

      const uid = verifyData.data.custom_data; // agar uid custom data me bheja ho
      const amount = Number(verifyData.data.amount);

      await db.ref(`users/${uid}/wallet`).update({
        totalCash: admin.database.ServerValue.increment(amount),
        updatedAt: Date.now()
      });

      await db.ref(`transactions/${order_id}`).update({
        status: "success"
      });

      return res.status(200).json({ message: "Wallet Updated" });
    }

    return res.status(400).json({ message: "Verification Failed" });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
      }
