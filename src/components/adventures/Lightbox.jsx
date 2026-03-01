import { useState, useEffect } from 'react'

export default function Lightbox({ photos, peakName, onClose, startIndex = 0 }) {
  const [idx, setIdx] = useState(startIndex)
  const photo = photos[idx]
  const hasMultiple = photos.length > 1

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, photos.length - 1))
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, photos.length])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="relative max-w-4xl w-full">
        <img
          src={photo.url}
          alt={photo.caption || peakName}
          className="w-full h-auto rounded"
          style={{ maxHeight: '80vh', objectFit: 'contain' }}
        />
        {photo.caption && (
          <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {photo.caption}
          </p>
        )}
        {hasMultiple && (
          <p className="text-xs mt-1 text-center tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {idx + 1} / {photos.length}
          </p>
        )}
        {hasMultiple && idx > 0 && (
          <button
            onClick={() => setIdx(i => i - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-white text-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            ‹
          </button>
        )}
        {hasMultiple && idx < photos.length - 1 && (
          <button
            onClick={() => setIdx(i => i + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-white text-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            ›
          </button>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
