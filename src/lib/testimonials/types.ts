export interface TestimonialRow {
  id: number;
  name: string;
  place: string;
  review_text: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  place: string;
  text: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function rowToTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    place: row.place,
    text: row.review_text,
    rating: row.rating,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
