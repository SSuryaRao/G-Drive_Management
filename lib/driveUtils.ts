export interface ParsedDriveUrl {
  id: string
  type: 'file' | 'folder'
}

export function parseDriveUrl(url: string): ParsedDriveUrl | null {
  try {
    new URL(url) // validate URL format

    const folderMatch = url.match(/\/drive\/folders\/([a-zA-Z0-9_-]+)/)
    if (folderMatch) return { id: folderMatch[1], type: 'folder' }

    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch) return { id: fileMatch[1], type: 'file' }

    const docsMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)
    if (docsMatch) return { id: docsMatch[1], type: 'file' }

    const sheetsMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
    if (sheetsMatch) return { id: sheetsMatch[1], type: 'file' }

    const slidesMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/)
    if (slidesMatch) return { id: slidesMatch[1], type: 'file' }

    const urlObj = new URL(url)
    const openId = urlObj.searchParams.get('id')
    if (openId) return { id: openId, type: 'file' }

    return null
  } catch {
    return null
  }
}

export function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export function getDriveFileUrl(fileId: string, type: 'file' | 'folder'): string {
  if (type === 'folder') {
    return `https://drive.google.com/drive/folders/${fileId}`
  }
  return `https://drive.google.com/file/d/${fileId}/view`
}
