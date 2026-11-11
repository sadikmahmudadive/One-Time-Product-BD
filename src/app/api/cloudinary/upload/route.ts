import { NextResponse } from "next/server";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary/server";

export async function POST(req: Request) {
  try {
    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        { error: "Cloudinary is not configured in .env.local" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No valid file provided in 'file' field" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = (formData.get("folder") as string) || "one-time-product-bd";

    const result = await uploadToCloudinary(buffer, { folder });

    return NextResponse.json({
      publicId: result.public_id,
      secureUrl: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

