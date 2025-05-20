import { NextRequest, NextResponse } from 'next/server';

const FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID!;
const FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET!;

async function getForgeToken() {
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
        scope: 'data:read data:write',
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get Forge token');
  }

  return await response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { objectId } = body;

    if (!objectId) {
      return NextResponse.json(
        { error: 'No objectId provided' },
        { status: 400 }
      );
    }

    const { access_token } = await getForgeToken();

    // Lancer la conversion
    const translateResponse = await fetch(
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            urn: Buffer.from(objectId).toString('base64'),
          },
          output: {
            formats: [
              {
                type: 'svf',
                views: ['2d', '3d'],
              },
            ],
          },
        }),
      }
    );

    if (!translateResponse.ok) {
      throw new Error('Failed to start translation');
    }

    const translateData = await translateResponse.json();
    
    return NextResponse.json({
      urn: translateData.urn,
      status: translateData.result,
    });
  } catch (error) {
    console.error('Error translating file:', error);
    return NextResponse.json(
      { error: 'Failed to translate file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urn = searchParams.get('urn');

    if (!urn) {
      return NextResponse.json(
        { error: 'No urn provided' },
        { status: 400 }
      );
    }

    const { access_token } = await getForgeToken();

    // Vérifier le statut de la conversion
    const manifestResponse = await fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!manifestResponse.ok) {
      throw new Error('Failed to get manifest');
    }

    const manifestData = await manifestResponse.json();
    
    return NextResponse.json(manifestData);
  } catch (error) {
    console.error('Error checking translation status:', error);
    return NextResponse.json(
      { error: 'Failed to check translation status' },
      { status: 500 }
    );
  }
} 