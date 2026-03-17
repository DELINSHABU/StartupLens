// Client-safe wrappers that call server-side API routes

async function fetchAPI(url: string, body: Record<string, unknown>) {
  // Dispatch AI request event for status bar
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ai:request'));
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  
  if (!res.ok || data.error) {
    // Dispatch error event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai:error'));
    }
    throw new Error(data.error || `API error ${res.status}`);
  }
  
  // Dispatch success event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ai:response'));
  }
  
  return data;
}

export async function evaluateStartup(name: string, pitch: string) {
  return fetchAPI("/api/evaluate", { name, pitch });
}

export async function matchInvestors(startup: string, investors: string) {
  return fetchAPI("/api/match", { startup, investors });
}

export async function generateOutreachEmail(
  startupName: string,
  founderName: string,
  investorName: string,
  investorFocus: string,
  startupPitch: string
) {
  return fetchAPI("/api/outreach", { startupName, founderName, investorName, investorFocus, startupPitch });
}

export async function coachPitch(startupName: string, pitch: string) {
  return fetchAPI("/api/pitch-coach", { startupName, pitch });
}
