import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

const router = Router();

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

router.post('/ai-recommendations', async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;

    if (!query) {
      console.error('[SERVER] ❌ Missing query.');
      res.status(400).json({ message: "Missing query." });
      return;
    }

    console.log('[SERVER] 📩 Query received:', query);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", 
        messages: [
          {
            role: "system",
            content: `
You are an API specialized in extracting structured tags for restaurant recommendation.

RULES:
- Output ONLY clean JSON without ANY formatting (no explanations, no "here is", no markdown, no code block).
- Your ONLY output must be valid JSON.

STRUCTURE TO FOLLOW:
{
  "food_tags": [...],
  "ambiance_tags": [...],
  "price_tag": "...",
  "features": [...]
}

TAGGING:
- Food Tags: Match any dish, cuisine or ingredient (e.g. BBQ, pasta, sushi, burger, pizza, etc.)
- Ambiance Tags: Match any vibe, view, setting, or atmosphere (e.g. romantic, rooftop, cozy, sea view, mountain view)
- Price Tag: Estimate from cheap to expensive if mentioned (under_20_per_person, under_30_per_person, under_50_per_person, expensive)
- Features: Match features like live music, dog friendly, outdoor seating, etc.

IMPORTANT:
- If no tags match a category, use empty array [] or empty string "".
- Do not add custom keys or modify the structure.
            `
          },
          {
            role: "user",
            content: query
          }
        ]
      })
    });

    const data = await response.json();
    console.log('[SERVER] 🔵 Raw response from OpenRouter:', JSON.stringify(data, null, 2));

    const structuredOutput = data.choices?.[0]?.message?.content;

    if (!structuredOutput) {
      console.error('[SERVER] ❌ No structured output from AI.');
      res.status(500).json({ message: "No structured output from AI." });
      return;
    }

    console.log('[SERVER] ✨ Raw structuredOutput:', structuredOutput);

    const cleanOutput = structuredOutput
      .replace(/^```json\s*/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '');

    console.log('[SERVER] 🧹 Cleaned output:', cleanOutput);

    const fixedOutput = cleanOutput
      .replace(/"feature"\s*:/g, '"features":')
      .replace(/"ambiance_tag"\s*:/g, '"ambiance_tags":')
      .replace(/"food_tag"\s*:/g, '"food_tags":');

    console.log('[SERVER] 🛠️ Fixed output:', fixedOutput);

    try {
      const parsedOutput = JSON.parse(fixedOutput);
      console.log('[SERVER] ✅ Final parsed output:', parsedOutput);
      res.status(200).json(parsedOutput);
    } catch (parseError) {
      console.error('[SERVER] ❌ Error parsing AI output:', parseError);
      res.status(500).json({ message: 'Invalid JSON from AI.' });
    }

  } catch (error) {
    console.error('[SERVER] 🔥 AI Recommendation Error:', error);
    res.status(500).json({ message: "Server error talking to AI." });
  }
});

export default router;
