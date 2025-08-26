// routes/ChatRouter.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';

dotenv.config();

const router = express.Router();

// -----------------------------
// Initialize Groq client
// -----------------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// -----------------------------
// Default prompts for police dashboard
// -----------------------------
const defaultPrompts = [
  "Can you explain the difference between GD/FIR?",
  "When should I file a GD or FIR?",
  "How do I report a crime using this app?",
  "How to track my complaint?",
  "How does anonymous reporting work?",
  "What information is needed for a proper complaint?"
];

// -----------------------------
// Rate limiting
// -----------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

router.use(limiter);

// -----------------------------
// GET /api/chat/prompts
// -----------------------------
router.get('/prompts', (req, res) => {
  res.status(200).json({ prompts: defaultPrompts });
});

// -----------------------------
// POST /api/chat
// Handles user messages via Groq AI
// -----------------------------
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
        response: "Please type something to chat."
      });
    }

    console.log(`Received message for chatbot: ${message}`);

    // -----------------------------
    // Call Groq chat completion
    // -----------------------------
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Groq free model
      messages: [
        {
          role: "system",
          content: "You are a police assistant AI. Answer the user's queries regarding police services clearly and accurately. Provide helpful guidance about reporting crimes, filing GD/FIR, and tracking complaints."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const botReply = completion.choices[0]?.message?.content || 
                     "Sorry, I couldn't process your request.";

    res.json({
      success: true,
      response: botReply,
      raw: completion
    });

  } catch (error) {
    console.error('Error in chatbot:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing chat message',
      response: "Sorry, there was an error with the chatbot. Please try again later."
    });
  }
});

// -----------------------------
// GET /api/chat (health check)
// -----------------------------
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
