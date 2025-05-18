import React from 'react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  url: string;
  onClose?: () => void;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
} 