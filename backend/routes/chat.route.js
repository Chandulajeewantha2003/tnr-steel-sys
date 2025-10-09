import express from "express";
import Product from "../models/product.model.js";
import Stock from "../models/stock.model.js";
import Sales from "../models/directsales.model.js";
// import Distribution from "../models/distribution.model.js"; // enable when model ready

const router = express.Router();

/**
 * Utility: Check if message contains any keyword
 */
const includesAny = (msg, keywords = []) => {
    return keywords.some((k) => msg.includes(k));
};

router.post("/", async(req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.json({ reply: "⚠️ Please type a message first." });
    }

    const msg = message.toLowerCase().trim();
    let reply = "⚠️ Sorry, I don't understand. Type 'help' to see options.";

    try {
        // ✅ Greetings
        if (includesAny(msg, ["hello", "hi", "hey"])) {
            reply = "👋 Hello! How can I assist you with TNR Steel today?";
        }

        // ✅ Show available products
        else if (includesAny(msg, ["products", "list products", "available products"])) {
            const products = await Product.find().limit(5);
            reply = products.length ?
                "📦 Available Products:\n" +
                products.map((p, i) => `${i + 1}. ${p.product_name || p.name}`).join("\n") :
                "❌ No products found in the system.";
        }

        // ✅ Stock availability
        else if (includesAny(msg, ["stock", "available stock", "inventory"])) {
            const stocks = await Stock.find().limit(5);
            reply = stocks.length ?
                "📊 Stock Levels:\n" +
                stocks
                .map(
                    (s, i) =>
                    `${i + 1}. ${s.product_name || "Unknown"} → ${s.quantity || 0}`
                )
                .join("\n") :
                "❌ No stock data available.";
        }

        // ✅ Daily sales
        else if (includesAny(msg, ["sales today", "today sales", "daily sales"])) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const sales = await Sales.find({
                date: { $gte: today, $lt: tomorrow },
            });

            if (sales.length > 0) {
                const total = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
                reply = `💰 Sales Today:\n- Total Amount: Rs.${total}\n- Transactions: ${sales.length}`;
            } else {
                reply = "❌ No sales recorded for today.";
            }
        }

        // ✅ Daily distributions (if model exists)
        else if (includesAny(msg, ["distribution", "daily distribution"])) {
            reply =
                "🚚 Distribution tracking is not connected yet. (Add Distribution model to enable this feature)";
            /*
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const dist = await Distribution.find({
              date: { $gte: today, $lt: tomorrow },
            });

            reply = dist.length
              ? `🚚 Today's Distributions: ${dist.length} deliveries completed.`
              : "❌ No distributions today.";
            */
        }

        // ✅ Employee help
        else if (includesAny(msg, ["employee", "staff", "workers"])) {
            reply = "👨‍🏭 Employee data is available in the Employee Management section.";
        }

        // ✅ General help
        else if (includesAny(msg, ["help", "options", "commands"])) {
            reply =
                "🤖 You can ask me things like:\n" +
                "- 'List products'\n" +
                "- 'Show stock'\n" +
                "- 'Daily sales'\n" +
                "- 'Daily distribution'\n" +
                "- 'Employee details'";
        }
    } catch (err) {
        console.error("Chatbot DB Error:", err);
        reply = "⚠️ Error fetching data from the system. Please try again later.";
    }

    res.json({ reply });
});

export default router;