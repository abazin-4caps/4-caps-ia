"use client"

import React, { useEffect, useRef, useState } from "react"

interface ForgeViewerProps {
  url?: string;
  urn?: string;
  onError?: (error: Error) => void;
  onDocumentLoadSuccess?: () => void;
}

const DEMO_URN = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtZGVtby1idWNrZXQvZW5naW5lLmR3Zw" // URN de démo Autodesk

declare global {
  interface Window {
    Autodesk: any;
  }
}

export default function ForgeViewer({ url, urn, onError, onDocumentLoadSuccess }: ForgeViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [viewer, setViewer] = useState<any>(null)
  const [isViewerInitialized, setIsViewerInitialized] = useState(false)

  useEffect(() => {
    let mounted = true;

    const loadForgeViewerScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.Autodesk?.Viewing) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Forge Viewer script'));
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css';
        document.head.appendChild(link);
      });
    };

    const initializeViewer = async () => {
      try {
        await loadForgeViewerScript();

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

    if (!isViewerInitialized) {
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
    if (!viewer || (!url && !urn) || !isViewerInitialized) return;

    const documentId = urn || btoa(url!);
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
  }, [viewer, url, urn, isViewerInitialized, onDocumentLoadSuccess, onError]);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={viewerRef} 
        className="flex-1 relative"
        style={{ minHeight: "600px", background: "#222" }}
      />
    </div>
  );
} 