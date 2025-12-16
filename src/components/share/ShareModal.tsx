'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { shareImage, shareToTelegram, shareToWhatsApp, shareToViber, shareToFacebook, downloadImage } from '@/lib/utils'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  dataUrl: string
  filename?: string
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  dataUrl,
  filename = 'marginalia-meme.png',
}) => {
  if (!isOpen) return null

  const handleShare = async (shareFn: (dataUrl: string) => void) => {
    // Спочатку спробуємо Web Share API
    const shared = await shareImage(dataUrl, filename)
    if (!shared) {
      // Якщо Web Share API не працює, використовуємо специфічну функцію
      shareFn(dataUrl)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-medieval-dark border-2 border-medieval-gold rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-decorative text-medieval-gold mb-4 text-center">
          Share Meme
        </h2>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={() => handleShare(shareToTelegram)}
            className="w-full"
            variant="secondary"
          >
            📱 Telegram
          </Button>
          
          <Button
            onClick={() => handleShare(shareToWhatsApp)}
            className="w-full"
            variant="secondary"
          >
            💬 WhatsApp
          </Button>
          
          <Button
            onClick={() => handleShare(shareToViber)}
            className="w-full"
            variant="secondary"
          >
            💜 Viber
          </Button>
          
          <Button
            onClick={() => handleShare(shareToFacebook)}
            className="w-full"
            variant="secondary"
          >
            📘 Facebook
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => {
              downloadImage(dataUrl, filename)
              onClose()
            }}
            variant="secondary"
            className="flex-1"
          >
            💾 Download
          </Button>
          
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}




