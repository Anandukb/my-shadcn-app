import { NextResponse } from 'next/server';
import { allPackages } from '@/data/packages';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const id = searchParams.get('id');

  if (id) {
    const pkg = allPackages.find((p) => p.id.toString() === id);
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }
    return NextResponse.json(pkg);
  }

  if (category) {
    const filtered = allPackages.filter((p) => p.category === category);
    return NextResponse.json({ packages: filtered });
  }

  return NextResponse.json({ packages: allPackages });
}
