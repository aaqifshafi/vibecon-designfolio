export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: {
    client?: string;
    role?: string;
    industry?: string;
    platform?: string;
  };
  introduction: string;
}

export interface ParsedResume {
  // Identity
  name: string;
  firstName: string;
  title: string;
  about?: string;
  location?: string;

  // Contact & Socials
  email?: string;
  phone?: string;
  linkedin?: string;
  dribbble?: string;
  twitter?: string;
  github?: string;
  website?: string;

  // Experience
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
  }[];

  // Projects — ALWAYS exactly 2
  projects: [ProjectItem, ProjectItem];

  // Tools
  tools: {
    name: string;
    icon: string;
  }[];

  // Recommendations
  recommendations: {
    id: string;
    name: string;
    role: string;
    content: string;
    image: string;
  }[];
}
