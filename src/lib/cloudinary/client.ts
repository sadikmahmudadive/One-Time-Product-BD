export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb" | "limit" | "pad";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "png" | "jpg";
  gravity?: "center" | "face" | "auto";
}

/**
 * Builds an optimized Cloudinary delivery URL with automatic formatting and compression.
 */
export function buildCloudinaryUrl(
  publicIdOrUrl: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!publicIdOrUrl) return "";

  // If already a full URL and not a Cloudinary raw upload, return as is
  if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
    return publicIdOrUrl;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || cloudName.includes("your_cloud_name")) {
    return publicIdOrUrl;
  }

  const transforms: string[] = [];

  // Automatic format (webp/avif depending on browser support)
  transforms.push(`f_${options.format || "auto"}`);

  // Automatic quality compression
  transforms.push(`q_${options.quality || "auto"}`);

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);

  const transformString = transforms.join(",");
  const cleanId = publicIdOrUrl.replace(/^\/+/, "");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${cleanId}`;
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Uploads a file directly to Cloudinary using signed parameters from /api/cloudinary/sign
 */
export async function uploadClientImage(file: File): Promise<UploadResult> {
  // 1. Get signature from our secure backend endpoint
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "one-time-product-bd" }),
  });

  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}));
    throw new Error(err.message || "Failed to obtain upload signature.");
  }

  const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

  // 2. Upload file directly to Cloudinary's secure upload API
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  if (folder) formData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to upload image to Cloudinary.");
  }

  const data = await uploadRes.json();
  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    format: data.format,
    width: data.width,
    height: data.height,
  };
}

