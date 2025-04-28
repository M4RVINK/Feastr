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
              - Food Tags: Match any dish, cuisine, ingredient, or drink (e.g., BBQ, pasta, sushi, burger, pizza, cocktails, beer, wine, drinks, etc.)
              - Ambiance Tags: Match any vibe, view, setting, or atmosphere (e.g., romantic, rooftop, cozy, sea view, mountain view, fun, celebration, party, date, casual, fine dining)
              - Features: Match amenities or services (e.g., live music, DJ, outdoor seating, dog friendly, family friendly, dancing, shisha, waterfront)

              SPECIAL CASES:
              - If the query mentions "drinks", "cocktails", "bar", "alcohol", "wine", "beer" ➔ Tag under "food_tags" and "features" as ["drinks", "cocktails", "bar"].
              - If the query mentions "DJ", "music", "party", "celebration" ➔ Tag under "features" (["DJ", "music", "dancing", "celebration"]).
              - If the query mentions "date", "fun", "celebration", "party" ➔ Tag under "ambiance_tags" as ["date", "fun", "celebration", "party"].
              - Try to tag "fun" as ambiance if query feels light-hearted, casual or party-focused.

              PRICE TAGGING:
              - Estimate based on wording if possible (e.g., cheap, affordable, luxury, fine dining)
              - Use: under_15_per_person, under_25_per_person, under_40_per_person, expensive

              IMPORTANT:
              - If no tags match a category, use empty array [] or empty string "".
              - Do not add any extra keys, comments, or modify the structure.
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
