import React, { useState } from 'react';
import { ImageViewer } from './ImageViewer';

interface ImageGridProps {
  images: string[];
  columns?: number;
}

export function ImageGrid({ images, columns = 3 }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <>
      <div 
        className={`grid gap-4`}
        style={{ 
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` 
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg bg-muted"
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {selectedImage !== null && (
        <ImageViewer
          images={images}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
} 