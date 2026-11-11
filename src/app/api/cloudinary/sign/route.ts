import { NextResponse } from "next/server";
import { generateUploadSignature, isCloudinaryConfigured } from "@/lib/cloudinary/server";

export async function POST(req: Request) {
  try {
    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured in .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "one-time-product-bd";

    const { signature, timestamp, apiKey, cloudName } = generateUploadSignature({ folder });

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}

