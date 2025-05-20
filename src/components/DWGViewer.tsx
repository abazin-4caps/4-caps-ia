'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import ForgeViewer from './ForgeViewer';

interface DWGViewerProps {
  existingFileUrl?: string;
}

export default function DWGViewer({ existingFileUrl }: DWGViewerProps) {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [urn, setUrn] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingFileUrl) {
      handleExistingFile(existingFileUrl);
    }
  }, [existingFileUrl]);

  const handleExistingFile = async (fileUrl: string) => {
    setIsLoading(true);
    setError('');
    setUploadStatus('Processing file...');

    try {
      // Lancer la conversion directement pour un fichier existant
      const translateResponse = await fetch('/api/forge/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectId: fileUrl,
        }),
      });

      if (!translateResponse.ok) {
        throw new Error('Failed to start conversion');
      }

      const translateData = await translateResponse.json();
      setUrn(translateData.urn);

      // Vérifier le statut de la conversion
      let status = 'pending';
      while (status === 'pending' || status === 'inprogress') {
        const statusResponse = await fetch(`/api/forge/translate?urn=${translateData.urn}`);
        const statusData = await statusResponse.json();
        
        status = statusData.status;
        if (status === 'success') {
          setUploadStatus('File ready for viewing');
          break;
        } else if (status === 'failed') {
          throw new Error('Conversion failed');
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUploadStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsLoading(true);
    setError('');
    setUploadStatus('Uploading file...');

    try {
      // Upload du fichier
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/forge/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadData = await uploadResponse.json();
      setUploadStatus('Converting file...');

      // Lancer la conversion
      const translateResponse = await fetch('/api/forge/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectId: uploadData.objectId,
        }),
      });

      if (!translateResponse.ok) {
        throw new Error('Failed to start conversion');
      }

      const translateData = await translateResponse.json();
      setUrn(translateData.urn);

      // Vérifier le statut de la conversion
      let status = 'pending';
      while (status === 'pending' || status === 'inprogress') {
        const statusResponse = await fetch(`/api/forge/translate?urn=${translateData.urn}`);
        const statusData = await statusResponse.json();
        
        status = statusData.status;
        if (status === 'success') {
          setUploadStatus('File ready for viewing');
          break;
        } else if (status === 'failed') {
          throw new Error('Conversion failed');
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUploadStatus('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: {
      'application/acad': ['.dwg'],
      'image/vnd.dwg': ['.dwg'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: !!existingFileUrl, // Désactive le clic si un fichier existe déjà
    noKeyboard: !!existingFileUrl, // Désactive la navigation clavier si un fichier existe déjà
    noDrag: !!existingFileUrl, // Désactive le drag & drop si un fichier existe déjà
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <div className="w-full h-full min-h-screen">
      {!urn && !existingFileUrl && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          <p className="text-lg mb-2">
            {isDragActive
              ? 'Drop the DWG file here'
              : 'Drag and drop a DWG file here, or click to select one'}
          </p>
          {isLoading && <p className="text-blue-600">{uploadStatus}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}

      {(urn || isLoading) && (
        <div className="w-full h-full min-h-screen">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-blue-600">{uploadStatus}</p>
            </div>
          ) : (
            <ForgeViewer
              fileUrl={urn}
              onError={(error) => setError(error.message)}
              onDocumentLoadSuccess={() => setUploadStatus('Document loaded successfully')}
            />
          )}
        </div>
      )}
    </div>
  );
} 