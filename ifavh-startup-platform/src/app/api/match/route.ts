import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { startup, investors } = await req.json();

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
                "You are a startup-investor matching expert. Always respond with valid JSON only, no markdown.",
            },
            {
              role: "user",
              content: `Given a startup profile and a list of investors, rank the best investor matches. Return JSON only (no markdown):
{
  "matches": [
    {
      "investorName": "<name>",
      "matchScore": <number 0-100>,
      "reason": "<why this is a good match>"
    }
  ]
}

Startup: ${startup}
Investors: ${investors}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("NVIDIA API error:", err);
      return NextResponse.json(
        { error: `NVIDIA API ${response.status}: ${err}` },
        { status: response.status }
      );
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
    console.error("AI match error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Matching failed" },
      { status: 500 }
    );
  }
}
