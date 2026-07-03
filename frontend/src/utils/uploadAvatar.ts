const MAX_SIZE = 2 * 1024 * 1024 // 2MB cho avatar

export async function uploadAvatar(userId: number, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Avatar must be an image')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Avatar must be smaller than 2MB')
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', `avatars/${userId}`)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )

  const data = (await res.json()) as { secure_url?: string; error?: { message?: string } }
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed')
  if (!data.secure_url) throw new Error('No URL returned')

  return data.secure_url
}