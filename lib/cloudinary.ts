import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(dataUri: string): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'bitedrop',
    transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
  })
  return result.secure_url
}

export { cloudinary }
