export type Profile = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  bio: string;
  bio_en: string | null;
  avatar_url: string | null;
  email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  cv_url: string | null;
  updated_at: string;
};

export type TechStack = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  category: string;
  sort_order: number;
  created_at: string;
};

export type ProjectStatus = "completed" | "in_progress";

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  summary_en: string | null;
  description: string;
  description_en: string | null;
  image_url: string | null;
  live_url: string | null;
  repo_url: string | null;
  featured: boolean;
  sort_order: number;
  status?: ProjectStatus;
  created_at: string;
  tech_stacks?: TechStack[];
};

export type ShortLink = {
  id: string;
  slug: string;
  destination_url: string;
  title: string;
  description?: string | null;
  clicks: number;
  is_pinned: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type PortfolioStat = {
  id: string;
  value: number;
  suffix: string;
  label: string;
  label_en: string | null;
  description: string;
  description_en: string | null;
  sort_order: number;
  created_at?: string;
};

export type ExperienceCategory = "education" | "work" | "organization" | "project";

export type Experience = {
  id: string;
  category?: ExperienceCategory | string;
  period: string;
  role: string;
  role_en: string | null;
  company: string;
  location: string;
  description: string;
  description_en: string | null;
  achievements: string;
  achievements_en: string | null;
  skills: string;
  is_current: boolean;
  sort_order: number;
  created_at?: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  role_en: string | null;
  company: string;
  avatar_url?: string | null;
  rating: number;
  content: string;
  content_en: string | null;
  project_ref?: string | null;
  sort_order: number;
  created_at?: string;
};
