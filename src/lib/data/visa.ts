export type Region = "Middle East" | "Asia" | "Europe" | "Africa" | "Americas" | "Oceania";

export type Country = {
    name: string;
    code: string; // ISO-like code
    slug: string;
    region: Region;
    flag: string; // emoji for simplicity
    description?: string;
    requirements?: string[];
    processingTime?: string;
    image?: string;
};

export const REGIONS: Region[] = [
    "Middle East",
    "Asia",
    "Europe",
    "Africa",
    "Americas",
    "Oceania",
];

export const COUNTRIES: Country[] = [
    {
        name: "Qatar",
        code: "QA",
        slug: "qatar",
        region: "Middle East",
        flag: "🇶🇦",
        description: "Experience the blend of tradition and modernity in Qatar.",
        requirements: ["Passport (6 months validity)", "Photo", "Hotel Booking"],
        processingTime: "2-3 Days",
        price: "QAR 100",
        image: "https://images.unsplash.com/photo-1575881875475-31023242e3f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "United Arab Emirates",
        code: "AE",
        slug: "united-arab-emirates",
        region: "Middle East",
        flag: "🇦🇪",
        description: "Visit Dubai, Abu Dhabi and more with ease.",
        requirements: ["Passport scan", "Photo", "Flight booking"],
        processingTime: "1-2 Days",
        price: "QAR 300",
        image: "https://images.unsplash.com/photo-1512453979798-5ea904ac6666?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "Saudi Arabia",
        code: "SA",
        slug: "saudi-arabia",
        region: "Middle East",
        flag: "🇸🇦",
        image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "Turkey",
        code: "TR",
        slug: "turkey",
        region: "Europe",
        flag: "🇹🇷",
        image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "Georgia",
        code: "GE",
        slug: "georgia",
        region: "Europe",
        flag: "🇬🇪",
        image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "United Kingdom",
        code: "GB",
        slug: "united-kingdom",
        region: "Europe",
        flag: "🇬🇧",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "India",
        code: "IN",
        slug: "india",
        region: "Asia",
        flag: "🇮🇳",
        image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "Thailand",
        code: "TH",
        slug: "thailand",
        region: "Asia",
        flag: "🇹🇭",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "Japan",
        code: "JP",
        slug: "japan",
        region: "Asia",
        flag: "🇯🇵",
        image: "https://images.unsplash.com/photo-1528164344705-4754268798be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "United States",
        code: "US",
        slug: "united-states",
        region: "Americas",
        flag: "🇺🇸",
        image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "Canada",
        code: "CA",
        slug: "canada",
        region: "Americas",
        flag: "🇨🇦",
        image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "Australia",
        code: "AU",
        slug: "australia",
        region: "Oceania",
        flag: "🇦🇺",
        image: "https://images.unsplash.com/photo-1523482580672-01e6f2eb60b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
        name: "Kenya",
        code: "KE",
        slug: "kenya",
        region: "Africa",
        flag: "🇰🇪",
        image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
];
