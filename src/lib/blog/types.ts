export interface BilingualText {
  en: string;
  ar: string;
}

export interface BlogPostRow {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string | null;
  excerpt_en: string;
  excerpt_ar: string | null;
  content_en: string;
  content_ar: string | null;
  cover_image: string;
  author: string;
  category: string | null;
  tags: string[];
  meta_title_en: string | null;
  meta_title_ar: string | null;
  meta_description_en: string | null;
  meta_description_ar: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}
