import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'public/data/blog-data.json');

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: 'Blog data not found. Please run npm run extract-data first.' },
        { status: 404 }
      );
    }

    const data = fs.readFileSync(dataPath, 'utf8');
    const blogData = JSON.parse(data);

    return NextResponse.json(blogData);
  } catch (error) {
    console.error('Error reading blog data:', error);
    return NextResponse.json(
      { error: 'Failed to load blog data' },
      { status: 500 }
    );
  }
}