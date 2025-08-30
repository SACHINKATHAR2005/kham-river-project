import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();

// Helper to build a strict system prompt to constrain domain
const SYSTEM_PROMPT = `You are an environmental water-quality assistant for river monitoring in India and globally.
- Answer ONLY questions about water quality, hydrology, environmental standards, pollution control, mitigation, public health impacts from water, and related environmental regulations and best practices.
- If a question is outside these topics (e.g., coding, finance, personal advice, unrelated general knowledge), politely refuse and say you only answer water-quality and environmental questions.
- Prefer Indian (CPCB, BIS IS 10500) and global (WHO, EPA, UNEP) standards and cite them generally (no fabricated URLs).
- Be concise, structured, and actionable. Use short bullet points when helpful.
- Keep each answer under 100 words. Avoid filler and repetition.
- If provided parameter context (name, value, normal range, station), tailor advice to that context.
- Avoid hallucinations. If unsure, say what would be needed to answer.`;

// Health check for easier troubleshooting
router.get('/health', (req, res) => {
  const hasKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
  const model = process.env.GROQ_MODEL || 'llama3-70b-8192';
  return res.json({ ok: true, groqApiKey: hasKey ? 'present' : 'missing', model });
});

router.post('/ask', async (req, res) => {
  try {
    const { question, param, value, stationName, standards, maxTokens, temperature } = req.body || {};

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GROQ_API_KEY is not set on the server. Please add it to your environment.'
      });
    }

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Invalid or missing question' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Build contextual user message
    const contextLines = [];
    if (param) contextLines.push(`Parameter: ${param}`);
    if (typeof value === 'number' || (typeof value === 'string' && value)) contextLines.push(`Observed value: ${value}`);
    if (standards && standards[param]) {
      const s = standards[param];
      contextLines.push(`Normal range for ${param}: ${s.min} – ${s.max} ${s.unit || ''}`.trim());
    }
    if (stationName) contextLines.push(`Station: ${stationName}`);

    const userContent = [
      contextLines.length ? `Context:\n${contextLines.join('\n')}` : null,
      `Question: ${question}`,
      `Instructions: Provide India/global-standard-aligned guidance. Include concrete mitigation steps, monitoring cadence, and when to escalate. Keep to the domain; refuse if out of scope. Limit to <= 100 words; avoid fluff.`
    ].filter(Boolean).join('\n\n');

    const model = process.env.GROQ_MODEL || 'llama3-70b-8192';
    const max_tokens = Number(maxTokens) || Number(process.env.GROQ_MAX_TOKENS) || 220;
    const temp = typeof temperature === 'number' ? temperature : (process.env.GROQ_TEMPERATURE ? Number(process.env.GROQ_TEMPERATURE) : 0.2);
    const completion = await groq.chat.completions.create({
      model,
      temperature: temp,
      max_tokens,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    });

    const answer = completion.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return res.status(502).json({ success: false, message: 'No response from AI. Check model name or API key.' });
    }

    res.json({ success: true, answer });
  } catch (error) {
    console.error('AI Ask Error:', error);
    const status = error?.status || 500;
    res.status(status).json({ success: false, message: 'Failed to process AI request', error: error?.message || String(error) });
  }
});

export default router;
