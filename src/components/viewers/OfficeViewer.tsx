import React from 'react';

interface OfficeViewerProps {
  url: string;
  onClose?: () => void;
}

export default function OfficeViewer({ url }: OfficeViewerProps) {
  return (
    <div className="h-full w-full">
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
        className="w-full h-full border-0"
        title="Microsoft Office Viewer"
      />
    </div>
  );
} 