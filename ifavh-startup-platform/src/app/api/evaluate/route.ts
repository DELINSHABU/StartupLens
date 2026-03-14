import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, pitch } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured. Add GROQ_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are an expert startup evaluator and venture capital analyst. Always respond with valid JSON only, no markdown.",
            },
            {
              role: "user",
              content: `Analyze this startup and return a JSON response with this EXACT structure (no markdown, just raw JSON):
{
  "overallScore": <number 0-100>,
  "scores": {
    "marketFit": <number 0-100>,
    "solutionDepth": <number 0-100>,
    "uniqueness": <number 0-100>,
    "viability": <number 0-100>
  },
  "verdict": "<one sentence verdict>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "investorInterest": "<High|Medium|Low>",
  "investorReason": "<short reason for investor interest level>",
  "confidence": <number 80-100>,
  "insights": {
    "marketSentiment": "<short market insight>",
    "competitorDensity": "<short competitor insight>",
    "recentExits": "<short exit multiple insight>",
    "redFlags": "<any red flags or 'None detected'>"
  }
}

Startup Name: ${name}
Pitch: ${pitch}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("AI evaluation error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Evaluation failed" },
      { status: 500 }
    );
  }
}
