export type Region = "Middle East" | "Asia" | "Europe" | "Africa" | "Americas" | "Oceania";

export const REGIONS: Region[] = ["Middle East", "Asia", "Europe", "Africa", "Americas", "Oceania"];

export interface VisaCountryRow {
  id: number;
  name: string;
  code: string;
  slug: string;
  region: Region;
  flag: string;
  description: string | null;
  requirements: string[];
  processing_time: string | null;
  price: string | null;
  image: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface VisaCountry {
  id: number;
  name: string;
  code: string;
  slug: string;
  region: Region;
  flag: string;
  description: string | null;
  requirements: string[];
  processingTime: string | null;
  price: string | null;
  image: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function rowToVisaCountry(row: VisaCountryRow): VisaCountry {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    slug: row.slug,
    region: row.region,
    flag: row.flag,
    description: row.description,
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    processingTime: row.processing_time,
    price: row.price,
    image: row.image,
    isFeatured: row.is_featured,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
