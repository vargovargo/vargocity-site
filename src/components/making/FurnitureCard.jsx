import { useState } from 'react'
import Lightbox from '../adventures/Lightbox'

export default function FurnitureCard({ item }) {
  const [lightbox, setLightbox] = useState(null)

  const photos = (item.photos || []).map(url => ({ url, caption: '' }))

  return (
    <div style={{ border: '1px solid #E5E5E0', backgroundColor: '#FFFFFF' }}
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
        <h3 className="text-base font-semibold" style={{ color: '#1A1A1A' }}>{item.name}</h3>
        <span className="text-xs tabular-nums shrink-0" style={{ color: '#8A8A8A' }}>{item.year}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {item.materials.map(m => (
          <span key={m} className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: '#F4F4F0', color: '#4A4A4A' }}>
            {m}
          </span>
        ))}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#4A4A4A' }}>{item.notes}</p>
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {photos.map((photo, i) => (
            <img key={i} src={photo.url} alt={item.name}
              className="w-full aspect-square object-cover cursor-pointer"
              style={{ border: '1px solid #E5E5E0' }}
              onClick={() => setLightbox(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
