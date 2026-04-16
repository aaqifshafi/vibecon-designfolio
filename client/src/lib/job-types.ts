export interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  matchScore: number;
  tags: string[];
  postedDate: string;
  url?: string;
  employerLogo?: string;
}

export type JobColumn = "ai-picks" | "shortlisted" | "applied" | "interview" | "offer";

export type JobColumns = Record<JobColumn, JobItem[]>;

export const COLUMN_LABELS: Record<JobColumn, string> = {
  "ai-picks": "AI Picks",
  "shortlisted": "Shortlisted",
  "applied": "Applied",
  "interview": "Interview",
  "offer": "Offer",
};

export const COLUMN_ORDER: JobColumn[] = ["ai-picks", "shortlisted", "applied", "interview", "offer"];

export const EMPTY_COLUMNS: JobColumns = {
  "ai-picks": [],
  "shortlisted": [],
  "applied": [],
  "interview": [],
  "offer": [],
};
