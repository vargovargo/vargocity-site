import { useState } from 'react'
import Lightbox from '../adventures/Lightbox'

export default function FurnitureCard({ item }) {
  const [lightbox, setLightbox] = useState(null)

  const photos = (item.photos || []).map(url => ({ url, caption: '' }))

  return (
    <div style={{ border: '1px solid var(--c-border)', backgroundColor: 'var(--c-surface)' }}
      className="p-6">
      {lightbox && (
        <Lightbox
          photos={photos}
          peakName={item.name}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h3 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>{item.name}</h3>
        <span className="text-xs tabular-nums shrink-0 font-data" style={{ color: 'var(--c-text-muted)' }}>{item.year}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {item.materials.map(m => (
          <span key={m} className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: 'var(--c-card-hover)', color: 'var(--c-text-body)' }}>
            {m}
          </span>
        ))}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-body)' }}>{item.notes}</p>
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {photos.map((photo, i) => (
            <img key={i} src={photo.url} alt={item.name}
              className="w-full aspect-square object-cover cursor-pointer"
              style={{ border: '1px solid var(--c-border)' }}
              onClick={() => setLightbox(i)}
            />
          ))}
        </div>
      )}
      {(item.url || item.pdf_url) && (
        <div className="flex gap-4 mt-4">
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="text-xs transition-colors"
              style={{ color: 'var(--c-text-muted)' }}>
              {item.url_label || 'View'} →
            </a>
          )}
          {item.pdf_url && (
            <a href={item.pdf_url} target="_blank" rel="noopener noreferrer"
              className="text-xs transition-colors"
              style={{ color: 'var(--c-text-muted)' }}>
              Download PDF →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
