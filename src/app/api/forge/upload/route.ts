import { NextRequest, NextResponse } from 'next/server';

const FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID!;
const FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET!;
const BUCKET_KEY = 'caps-ia-bucket'; // Vous pouvez personnaliser ce nom

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
        scope: 'bucket:create bucket:read data:write data:read',
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get Forge token');
  }

  return await response.json();
}

async function createBucketIfNotExists(token: string) {
  try {
    // Vérifier si le bucket existe
    const checkResponse = await fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/details`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (checkResponse.ok) {
      return; // Le bucket existe déjà
    }

    // Créer le bucket s'il n'existe pas
    const createResponse = await fetch(
      'https://developer.api.autodesk.com/oss/v2/buckets',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketKey: BUCKET_KEY,
          policyKey: 'persistent',
        }),
      }
    );

    if (!createResponse.ok) {
      throw new Error('Failed to create bucket');
    }
  } catch (error) {
    console.error('Error managing bucket:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Obtenir le token
    const { access_token } = await getForgeToken();

    // Créer le bucket si nécessaire
    await createBucketIfNotExists(access_token);

    // Upload du fichier
    const buffer = await file.arrayBuffer();
    const uploadResponse = await fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${BUCKET_KEY}/objects/${file.name}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/octet-stream',
        },
        body: buffer,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    const uploadData = await uploadResponse.json();
    
    return NextResponse.json({
      objectId: uploadData.objectId,
      objectKey: file.name,
      bucketKey: BUCKET_KEY,
      sha1: uploadData.sha1,
      size: uploadData.size,
      location: uploadData.location,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 