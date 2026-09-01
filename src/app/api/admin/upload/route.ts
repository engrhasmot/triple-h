import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Media from '@/models/media.model';
import { hasPermission } from '@/lib/permissions';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function uploadFromBuffer(buffer: Buffer, folder: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission((payload as any).role, "canManageMedia")) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, SVG' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10 MB' }, { status: 400 });
    }

    const folder = (formData.get('folder') as string) || 'triple-h/uploads';
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadFromBuffer(buffer, folder);

    await dbConnect();
    await Media.create({
      url: result.secure_url,
      publicId: result.public_id,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      uploadedBy: 'admin',
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      secure_url: result.secure_url,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
