'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface ForgeViewerProps {
  fileUrl: string;
  onError?: (error: Error) => void;
  onDocumentLoadSuccess?: () => void;
}

export default function ForgeViewer({ fileUrl, onError, onDocumentLoadSuccess }: ForgeViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [isViewerInitialized, setIsViewerInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeViewer = async () => {
      try {
        if (!window.Autodesk?.Viewing) {
          console.error('Forge Viewer not loaded');
          return;
        }

        const options = {
          env: 'AutodeskProduction',
          api: 'derivativeV2',
          getAccessToken: async () => {
            try {
              const response = await fetch('/api/forge/token');
              const json = await response.json();
              return {
                access_token: json.access_token,
                expires_in: json.expires_in
              };
            } catch (error) {
              console.error('Error getting access token:', error);
              throw error;
            }
          }
        };

        window.Autodesk.Viewing.Initializer(options, () => {
          if (!mounted) return;

          const viewer = new window.Autodesk.Viewing.GuiViewer3D(viewerRef.current!, {
            extensions: ['Autodesk.DocumentBrowser']
          });

          viewer.start();
          setViewer(viewer);
          setIsViewerInitialized(true);
        });
      } catch (error) {
        console.error('Error initializing viewer:', error);
        onError?.(error as Error);
      }
    };

    if (window.Autodesk?.Viewing && !isViewerInitialized) {
      initializeViewer();
    }

    return () => {
      mounted = false;
      if (viewer) {
        viewer.finish();
      }
    };
  }, [onError, isViewerInitialized]);

  useEffect(() => {
    if (!viewer || !fileUrl || !isViewerInitialized) return;

    const documentId = btoa(fileUrl);
    window.Autodesk.Viewing.Document.load(
      documentId,
      (doc: any) => {
        const viewables = doc.getRoot().getDefaultGeometry();
        viewer.loadDocumentNode(doc, viewables);
        onDocumentLoadSuccess?.();
      },
      (error: Error) => {
        console.error('Error loading document:', error);
        onError?.(error);
      }
    );
  }, [viewer, fileUrl, isViewerInitialized, onDocumentLoadSuccess, onError]);

  return (
    <>
      <Script 
        src="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js"
        onLoad={() => setIsViewerInitialized(false)}
      />
      <link 
        rel="stylesheet" 
        type="text/css" 
        href="https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css" 
      />
      <div 
        ref={viewerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '500px',
          position: 'relative' 
        }} 
      />
    </>
  );
} 