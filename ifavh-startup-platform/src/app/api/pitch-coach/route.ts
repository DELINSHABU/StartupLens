import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { startupName, pitch } = await req.json();

    if (!pitch?.trim()) {
      return NextResponse.json(
        { error: "Pitch is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NVIDIA API key not configured. Add NVIDIA_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-nemotron",
          messages: [
            {
              role: "system",
              content:
                "You are an expert startup pitch coach for early-stage founders. Always respond with valid JSON only, no markdown.",
            },
            {
              role: "user",
              content: `Evaluate this startup pitch and return JSON only (no markdown) with this exact shape:
{
  "clarityScore": <number 0-100>,
  "persuasivenessScore": <number 0-100>,
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "issues": ["<issue1>", "<issue2>", "<issue3>"],
  "suggestedRewrite": "<clear and persuasive rewritten pitch (120-220 words)>",
  "shortVersion": "<1-2 sentence concise version>",
  "investorHook": "<one compelling opening sentence>",
  "nextSteps": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}

Startup Name: ${startupName || "Unnamed Startup"}
Pitch: ${pitch}`,
            },
          ],
          temperature: 0.6,
          max_tokens: 1400,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("NVIDIA API error (pitch coach):", err);
      return NextResponse.json(
        { error: `NVIDIA API ${response.status}: ${err}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      return NextResponse.json(
        { error: "No response content from NVIDIA model" },
        { status: 500 }
      );
    }

    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Pitch coaching failed";
    console.error("AI pitch coach error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
