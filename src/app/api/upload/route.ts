import { NextResponse } from 'next/server';
import { r2 } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Safe filename
    const ext = file.name.split('.').pop();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '').slice(0, 50);
    const filename = `uploads/${Date.now()}-${safeName}`;

    await r2.send(new PutObjectCommand({
      Bucket: 'trpickle',
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    }));

    // The public URL the user gave us earlier
    const publicUrl = `https://pub-4b1522a337474571adb7aefec13e7526.r2.dev/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Yükleme başarısız oldu.', details: error.message }, { status: 500 });
  }
}
