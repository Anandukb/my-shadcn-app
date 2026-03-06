export interface Package {
    id: number;
    category: string;
    title: string;
    description: string;
    price: number;
    image: string;
    duration: string;
    location: string;
    continent: string;
    rating: number;
    reviews: number;
    featured: boolean;
    includes: string[];
}
