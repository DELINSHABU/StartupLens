export interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  stage: string;
  pitch: string;
  website?: string;
  founderId: string;
  founderName: string;
  createdAt: Date;
}

export interface Investor {
  id: string;
  name: string;
  bio: string;
  focusAreas: string[];
  checkSize: string;
  stagePreference: string;
  contactEmail?: string;
  createdAt: Date;
}

export interface Evaluation {
  id: string;
  startupId: string;
  startupName: string;
  overallScore: number;
  scores: {
    marketFit: number;
    solutionDepth: number;
    uniqueness: number;
    viability: number;
  };
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  investorInterest: string;
  confidence: number;
  createdAt: Date;
}

export interface FundingRound {
  id: string;
  startupName: string;
  round: string;
  target: number;
  raised: number;
  status: string;
  leadInvestor?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  createdAt: Date;
}
