import { NextResponse } from 'next/server';

const FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID!;
const FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET!;

export async function GET() {
  try {
    const response = await fetch(
      'https://developer.api.autodesk.com/authentication/v2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: FORGE_CLIENT_ID,
          client_secret: FORGE_CLIENT_SECRET,
          grant_type: 'client_credentials',
          scope: 'data:read viewables:read',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get Forge token');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting Forge token:', error);
    return NextResponse.json(
      { error: 'Failed to get Forge token' },
      { status: 500 }
    );
  }
} 