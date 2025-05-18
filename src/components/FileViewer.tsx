import React from 'react';
import dynamic from 'next/dynamic';
import { ImageViewer } from './ImageViewer';

// Import dynamique des composants lourds
const PDFViewer = dynamic(() => import('./viewers/PDFViewer'), { ssr: false });
const OfficeViewer = dynamic(() => import('./viewers/OfficeViewer'), { ssr: false });
const ModelViewer = dynamic(() => import('./viewers/ModelViewer'), { ssr: false });

export interface FileViewerProps {
  file: {
    url: string;
    type: string;
    name: string;
  };
  onClose?: () => void;
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const PDF_TYPES = ['application/pdf'];
const OFFICE_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
const MODEL_TYPES = [
  'model/dwg',
  'model/rvt',
  'model/ifc',
  'application/octet-stream' // Pour les fichiers .dwg, .rvt, .ifc
];

export function FileViewer({ file, onClose }: FileViewerProps) {
  const getViewer = () => {
    const { type, url } = file;

    if (IMAGE_TYPES.includes(type)) {
      return <ImageViewer images={[url]} onClose={onClose} />;
    }

    if (PDF_TYPES.includes(type)) {
      return <PDFViewer url={url} onClose={onClose} />;
    }

    if (OFFICE_TYPES.includes(type)) {
      return <OfficeViewer url={url} onClose={onClose} />;
    }

    if (MODEL_TYPES.includes(type)) {
      return <ModelViewer url={url} onClose={onClose} />;
    }

    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">
          Type de fichier non pris en charge : {type}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container h-full py-4">
        <div className="bg-card rounded-lg shadow-lg h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold truncate">{file.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {getViewer()}
          </div>
        </div>
      </div>
    </div>
  );
}

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18M6 6l12 12"/></svg>
); 