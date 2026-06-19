export type VideoType = 'youtube' | 'vimeo' | 'direct' | 'unknown'

export interface VideoInfo {
  type: VideoType
  embedUrl?: string
  src?: string
}

export function parseVideoUrl(url: string): VideoInfo {
  if (!url?.trim()) return { type: 'unknown' }

  const trimmed = url.trim()

  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (youtubeMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`,
    }
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed) || trimmed.startsWith('blob:')) {
    return { type: 'direct', src: trimmed }
  }

  if (trimmed.startsWith('http')) {
    return { type: 'direct', src: trimmed }
  }

  return { type: 'unknown' }
}
