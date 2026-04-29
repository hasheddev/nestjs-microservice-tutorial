import { v2 as cloudinary } from 'cloudinary';

export function initCloudinary() {
  const cloudName = process.env.CLOUNDINARY_CLOUD_NAME;
  const apikey = process.env.CLOUNDINARY_API_KEY;
  const secretKey = process.env.CLOUNDINARY_API_SECRET;
  if (!cloudName || !secretKey || !apikey) {
    throw new Error('Cloudinary secrets are missing');
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apikey,
    api_secret: secretKey,
  });
  return cloudinary;
}
