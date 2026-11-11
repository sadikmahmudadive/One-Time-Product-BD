import { v2 as cloudinary, type UploadApiResponse, type UploadApiOptions } from "cloudinary";

export const isCloudinaryConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.includes("your_cloud_name")
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads a file buffer or base64 string to Cloudinary on the server.
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  options: UploadApiOptions = {}
): Promise<UploadApiResponse> {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Please supply NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local."
    );
  }

  const defaultOptions: UploadApiOptions = {
    folder: "one-time-product-bd",
    resource_type: "auto",
    ...options,
  };

  if (typeof file === "string") {
    return cloudinary.uploader.upload(file, defaultOptions);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed without result"));
        resolve(result);
      }
    );
    uploadStream.end(file);
  });
}

/**
 * Generates an upload signature for secure direct client-side uploads.
 */
export function generateUploadSignature(
  paramsToSign: Record<string, string | number> = {}
): { signature: string; timestamp: number; apiKey: string; cloudName: string } {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured in .env.local");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsWithTimestamp = {
    folder: "one-time-product-bd",
    timestamp,
    ...paramsToSign,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsWithTimestamp,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
}

/**
 * Delete an asset from Cloudinary by public ID.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
) {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured in .env.local");
  }
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export { cloudinary };

