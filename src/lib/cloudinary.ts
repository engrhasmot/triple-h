import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Upload an image to Cloudinary with optimization defaults.
 */
export async function uploadImage(
  file: string,
  folder: string = 'triple-h/projects'
) {
  return cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:best', fetch_format: 'auto' },
    ],
  });
}

/**
 * Delete an image from Cloudinary by its public ID.
 */
export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Generate an optimized Cloudinary URL with transformations.
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): string {
  const { width, height, crop = 'fill', quality = 'auto:best' } = options;
  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        crop,
        quality,
        fetch_format: 'auto',
      },
    ],
    secure: true,
  });
}
