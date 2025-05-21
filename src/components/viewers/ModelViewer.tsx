import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ForgeViewer from './ForgeViewer';
import { Orbit, Move, ZoomIn, Maximize } from 'lucide-react';

interface ModelViewerProps {
  url: string;
  onClose?: () => void;
}

export default function ModelViewer({ url, onClose }: ModelViewerProps) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Orbit className="h-4 w-4 mr-2" />
            Orbite
          </Button>
          <Button variant="outline" size="sm">
            <Move className="h-4 w-4 mr-2" />
            Pan
          </Button>
          <Button variant="outline" size="sm">
            <ZoomIn className="h-4 w-4 mr-2" />
            Zoom
          </Button>
          <Button variant="outline" size="sm">
            <Maximize className="h-4 w-4 mr-2" />
            Ajuster
          </Button>
        </div>
      </div>

      {/* Viewer Container */}
      <div className="flex-1 relative">
        <ForgeViewer
          url={url}
          onError={(error) => {
            setError(error.message);
            setIsLoading(false);
          }}
          onDocumentLoadSuccess={() => setIsLoading(false)}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <p className="text-muted-foreground">
              Chargement du modèle 3D...
            </p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <p className="text-red-500">
              Erreur lors du chargement : {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 