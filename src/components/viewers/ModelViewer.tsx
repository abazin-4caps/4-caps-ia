import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ModelViewerProps {
  url: string;
  onClose?: () => void;
}

export default function ModelViewer({ url }: ModelViewerProps) {
  useEffect(() => {
    // Ici, nous initialiserons Autodesk Forge Viewer
    const initializeViewer = async () => {
      try {
        // Le code d'initialisation du viewer sera ajouté ici
        console.log('Initializing viewer for:', url);
      } catch (error) {
        console.error('Error initializing viewer:', error);
      }
    };

    initializeViewer();
  }, [url]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Orbite
          </Button>
          <Button variant="outline" size="sm">
            Pan
          </Button>
          <Button variant="outline" size="sm">
            Zoom
          </Button>
          <Button variant="outline" size="sm">
            Fit to View
          </Button>
        </div>
      </div>

      {/* Viewer Container */}
      <div className="flex-1 relative">
        <div id="forgeViewer" className="absolute inset-0">
          {/* Le viewer Forge sera monté ici */}
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Chargement du modèle 3D...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 