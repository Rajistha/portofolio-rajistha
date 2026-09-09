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

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  image_url: string | null;
  live_url: string | null;
  repo_url: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  tech_stacks?: TechStack[];
};
