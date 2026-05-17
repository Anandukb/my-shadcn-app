import { Package } from "@/types/package";
import initialPackages from "@/data/packages.json";

const STORAGE_KEY = "maram_packages";

// Helper to check if we are in the browser
const isBrowser = () => typeof window !== "undefined";

// Helper to get raw packages list from localStorage or initialize it
export function getStoredPackages(): Package[] {
  if (!isBrowser()) {
    return initialPackages as Package[];
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPackages));
    return initialPackages as Package[];
  }
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to parse stored packages", error);
    return initialPackages as Package[];
  }
}

// Helper to save packages to localStorage
function savePackages(packages: Package[]) {
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
    
    // Dispatch a custom event so other components (like header or homepage) can sync if they need to
    window.dispatchEvent(new Event("packages_updated"));
  }
}

// Simulated API Service
export const packagesService = {
  // Get all packages
  async getAll(): Promise<Package[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getStoredPackages();
  },

  // Get packages by category
  async getByCategory(category: string): Promise<Package[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const all = getStoredPackages();
    if (category === "all") return all;
    return all.filter((pkg) => pkg.category === category);
  },

  // Get package by ID
  async getById(id: number): Promise<Package | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const all = getStoredPackages();
    const pkg = all.find((p) => p.id === id);
    return pkg ? { ...pkg } : null;
  },

  // Create a new package
  async create(pkgData: Omit<Package, "id">): Promise<Package> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = getStoredPackages();
    
    // Find next available ID
    const maxId = all.reduce((max, p) => (p.id > max ? p.id : max), 0);
    const newPkg: Package = {
      ...pkgData,
      id: maxId + 1,
      rating: pkgData.rating || 5.0,
      reviews: pkgData.reviews || 0,
      featured: pkgData.featured || false,
      includes: pkgData.includes || [],
    };
    
    all.push(newPkg);
    savePackages(all);
    return newPkg;
  },

  // Update an existing package
  async update(id: number, pkgData: Partial<Package>): Promise<Package> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = getStoredPackages();
    const index = all.findIndex((p) => p.id === id);
    
    if (index === -1) {
      throw new Error(`Package with ID ${id} not found.`);
    }
    
    const updatedPkg = {
      ...all[index],
      ...pkgData,
    };
    
    all[index] = updatedPkg;
    savePackages(all);
    return updatedPkg;
  },

  // Delete a package
  async delete(id: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const all = getStoredPackages();
    const filtered = all.filter((p) => p.id !== id);
    
    if (filtered.length === all.length) {
      return false;
    }
    
    savePackages(filtered);
    return true;
  },

  // Toggle favorite / featured status
  async toggleFeatured(id: number): Promise<Package> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const all = getStoredPackages();
    const index = all.findIndex((p) => p.id === id);
    
    if (index === -1) {
      throw new Error(`Package with ID ${id} not found.`);
    }
    
    const updatedPkg = {
      ...all[index],
      featured: !all[index].featured,
    };
    
    all[index] = updatedPkg;
    savePackages(all);
    return updatedPkg;
  }
};
