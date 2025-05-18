import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ImageViewerProps {
  images: string[];
  onClose?: () => void;
}

export function ImageViewer({ images, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetTransforms();
  };

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetTransforms();
  };

  const resetTransforms = () => {
    setScale(1);
    setRotation(0);
  };

  const zoomIn = () => setScale((prev) => prev + 0.1);
  const zoomOut = () => setScale((prev) => Math.max(0.1, prev - 0.1));
  const rotateRight = () => setRotation((prev) => prev + 90);
  const rotateLeft = () => setRotation((prev) => prev - 90);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container flex h-full flex-col items-center justify-center">
        {/* Toolbar */}
        <div className="fixed top-4 left-4 right-4 flex justify-between items-center bg-card rounded-lg p-2 shadow-lg">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={zoomIn}>
              <PlusIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={zoomOut}>
              <MinusIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={rotateLeft}>
              <RotateCounterClockwiseIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={rotateRight}>
              <RotateClockwiseIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={resetTransforms}>
              <ResetIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-1/2 -translate-y-1/2"
            onClick={previousImage}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          
          <div className="relative max-w-full max-h-full overflow-hidden">
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain transition-transform duration-200"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
              }}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="fixed right-4 top-1/2 -translate-y-1/2"
            onClick={nextImage}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Counter */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Icons components
const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14M5 12h14"/></svg>
);

const MinusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/></svg>
);

const RotateClockwiseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
);

const RotateCounterClockwiseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9C9.48 3 7.07 4 5.26 5.74L3 8"/><path d="M3 3v5h5"/></svg>
);

const ResetIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18M6 6l12 12"/></svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
); 