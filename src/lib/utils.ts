export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function downloadImage(dataUrl: string, filename: string = 'meme.png'): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function shareImage(dataUrl: string, filename: string = 'meme.png'): Promise<boolean> {
  try {
    // Конвертуємо data URL в File
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const file = new File([blob], filename, { type: 'image/png' })

    // Перевіряємо чи підтримується Web Share API
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Marginalia Meme',
        text: 'Check out this medieval meme!',
      })
      return true
    }
    return false
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing image:', error)
    }
    return false
  }
}

export function shareToTelegram(dataUrl: string): void {
  // Для Telegram потрібно завантажити файл або використати Web Share API
  // Якщо Web Share API не працює, завантажуємо файл
  shareImage(dataUrl, 'marginalia-meme.png').catch(() => {
    downloadImage(dataUrl, 'marginalia-meme.png')
  })
}

export function shareToWhatsApp(dataUrl: string): void {
  const text = encodeURIComponent('Check out my medieval meme!')
  const url = `https://wa.me/?text=${text}`
  
  // Спочатку спробуємо Web Share API
  shareImage(dataUrl, 'marginalia-meme.png').catch(() => {
    // Fallback: відкриваємо WhatsApp Web з текстом
    window.open(url, '_blank')
    // Також завантажуємо файл для ручного шарингу
    setTimeout(() => {
      downloadImage(dataUrl, 'marginalia-meme.png')
    }, 500)
  })
}

export function shareToViber(dataUrl: string): void {
  // Viber не підтримує прямі посилання для шарингу файлів через URL
  // Використовуємо Web Share API або завантажуємо файл
  shareImage(dataUrl, 'marginalia-meme.png').catch(() => {
    // Fallback: завантажуємо файл для ручного шарингу
    downloadImage(dataUrl, 'marginalia-meme.png')
  })
}

export function shareToFacebook(dataUrl: string): void {
  // Facebook не підтримує прямі посилання для шарингу файлів
  // Використовуємо Web Share API або завантажуємо файл
  shareImage(dataUrl, 'marginalia-meme.png').catch(() => {
    // Fallback: відкриваємо Facebook з текстом
    const text = encodeURIComponent('Check out my medieval meme!')
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`
    window.open(url, '_blank', 'width=600,height=400')
    // Також завантажуємо файл для ручного шарингу
    setTimeout(() => {
      downloadImage(dataUrl, 'marginalia-meme.png')
    }, 500)
  })
}

