import { Package } from "@/types/package";
import { allPackages } from "@/data/packages";

// This simulates an API call that returns JSON content
export async function getPackagesByCategory(category: string): Promise<Package[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const filtered = category === "all" ? allPackages : allPackages.filter((pkg) => pkg.category === category);
  // Return a cloned JSON object to simulate API parsing
  return JSON.parse(JSON.stringify(filtered));
}

export async function getPackageById(id: string): Promise<Package | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const pkg = allPackages.find((p) => p.id.toString() === id);
  if (!pkg) return null;
  
  return JSON.parse(JSON.stringify(pkg));
}
