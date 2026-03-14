import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function cleanJSON(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

export async function evaluateStartup(name: string, pitch: string) {
  const prompt = `You are an expert startup evaluator and venture capital analyst. Analyze this startup and return a JSON response with this EXACT structure (no markdown, just raw JSON):
{
  "overallScore": <number 0-100>,
  "scores": {
    "marketFit": <number 0-100>,
    "solutionDepth": <number 0-100>,
    "uniqueness": <number 0-100>,
    "viability": <number 0-100>
  },
  "verdict": "<one sentence verdict in quotes>",
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
Pitch: ${pitch}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(cleanJSON(response));
}

export async function matchInvestors(
  startup: string,
  investors: string
) {
  const prompt = `You are a startup-investor matching expert. Given a startup profile and a list of investors, rank the best investor matches. Return JSON only (no markdown):
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
Investors: ${investors}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(cleanJSON(response));
}
