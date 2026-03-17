const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const axios = require("axios");

const app = express();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(cors());
app.use(express.json());

// 🔑 API KEY
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// 🧠 TEMP USER STORAGE
let users = {};

// ============================
// 🧠 AI FUNCTION
// ============================
async function extractTask(input) {
  const response = await client.chat.completions.create({
    model: "meta-llama/llama-3-8b-instruct",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are a strict JSON generator.

Extract:
- title (short, no time words)
- time (ISO 8601 format WITH timezone +05:30)

Rules:
- Return ONLY valid JSON
- No explanation
- No extra text

Current date: 2026-03-17

Example:
Input: "Exam tomorrow at 5pm"
Output:
{ "title": "Exam", "time": "2026-03-18T17:00:00+05:30" }
`
      },
      {
        role: "user",
        content: input
      }
    ]
  });

  return safeParse(response.choices[0].message.content);
}

// ============================
// 🛡️ SAFE PARSER
// ============================
function safeParse(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Invalid AI JSON");
  }
}

// ============================
// 🧪 TIME VALIDATION
// ============================
function isValidISOTime(time) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/.test(time);
}

// ============================
// ❤️ HEALTH CHECK
// ============================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ============================
// 📝 REGISTER USER
// ============================
app.post("/register", async (req, res) => {
  const { phone, email } = req.body;

  if (!phone || !email) {
    return res.status(400).json({ error: "Missing phone or email" });
  }

  const { data, error } = await supabase
    .from("users")
    .upsert([{ phone, email }]); // insert or update

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  console.log("✅ User stored:", data);

  res.json({ success: true });
});

// ============================
// 🚀 MAIN ROUTE
// ============================
app.post("/send", async (req, res) => {
  try {
    const { input, phone } = req.body;

    if (!input || !phone) {
      return res.status(400).json({ error: "Missing input or phone" });
    }

    // 🔍 Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: "User not registered" });
    }

    const email = user.email;

    // 🧠 AI extraction
    const extracted = await extractTask(input);
    console.log("🧠 AI Output:", extracted);

    if (!extracted.title || !extracted.time) {
      return res.status(400).json({
        error: "Could not understand task. Try 'meeting tomorrow at 6'"
      });
    }

    // 🔧 Ensure timezone
    let time = extracted.time;
    if (!time.includes("+05:30")) {
      time = time + "+05:30";
    }

    // 🧪 Validate time format
    if (!isValidISOTime(time)) {
      return res.status(400).json({ error: "Invalid time format" });
    }

    // ⛔ Prevent past scheduling
    if (new Date(time) < new Date()) {
      return res.status(400).json({
        error: "Time is in the past. Please choose a future time."
      });
    }

    // 📱 Normalize phone for Twilio
    const formattedPhone = phone.startsWith("whatsapp:")
      ? phone
      : "whatsapp:" + phone;

    // 🎯 Final payload
    const payload = {
      title: extracted.title,
      time: time,
      phone: formattedPhone,
      email: email
    };

    console.log("📤 Sending to n8n:", payload);

    // 🔗 Send to n8n webhook
    try {
      const response = await axios.post(
        "https://dkeie.app.n8n.cloud/webhook/campusflow",
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 5000
        }
      );

      console.log("✅ n8n response:", response.status);

    } catch (err) {
      console.log("❌ n8n ERROR:", err.response?.data || err.message);

      return res.status(500).json({
        error: "Failed to trigger automation"
      });
    }

    // ✅ FINAL RESPONSE
    res.json({
      success: true,
      message: `Scheduled "${payload.title}" at ${payload.time}`,
      data: payload
    });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error.message);

    res.status(500).json({
      error: "Something went wrong",
      details: error.message
    });
  }
});

// ============================
// ▶️ START SERVER
// ============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});