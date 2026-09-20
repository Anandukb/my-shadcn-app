export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: string;
}
