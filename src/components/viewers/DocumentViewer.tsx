"use client"

import React, { useState } from 'react'
import { Document } from '@/types/document'
import { FileViewer } from '@/components/FileViewer'
import { ImageViewer } from '@/components/ImageViewer'
import { FileX } from 'lucide-react'
import ForgeViewer from './ForgeViewer'

interface DocumentViewerProps {
  document: Document | null
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Sélectionnez un document pour le visualiser
      </div>
    )
  }

  if (document.type === 'folder') {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Ceci est un dossier. Sélectionnez un fichier pour le visualiser.
      </div>
    )
  }

  if (!document.url) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Ce document n'a pas de fichier associé
      </div>
    )
  }

  const fileExtension = document.name.split('.').pop()?.toLowerCase()

  if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <img 
          src={document.url} 
          alt={document.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )
  }

  if (fileExtension === 'pdf') {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`
    return (
      <iframe
        src={viewerUrl}
        className="w-full h-full border-0 rounded-lg"
        title={document.name}
      />
    )
  }

  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExtension || '')) {
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.url)}`
    return (
      <iframe
        src={officeUrl}
        className="w-full h-full border-0 rounded-lg"
        title={document.name}
      />
    )
  }

  if (["dwg", "dxf", "rvt", "ifc"].includes(fileExtension || '')) {
    if (!document.urn) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500 mb-4">
            Ce fichier n'a pas encore été converti pour la visualisation 3D
          </p>
          <a 
            href={document.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Télécharger le fichier
          </a>
        </div>
      )
    }

    return (
      <div className="h-full w-full">
        <ForgeViewer
          url={document.url}
          urn={document.urn}
          onError={(error) => setError(error.message)}
          onDocumentLoadSuccess={() => setIsLoading(false)}
        />
        {error && (
          <div className="mt-4 flex flex-col items-center">
            <p className="text-red-500 mb-4">{error}</p>
            <a
              href={`https://viewer.autodesk.com/?url=${encodeURIComponent(document.url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Ouvrir dans Autodesk Viewer (en ligne)
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-gray-500 mb-4">
        Ce type de fichier ne peut pas être visualisé directement
      </p>
      <a 
        href={document.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Télécharger le fichier
      </a>
    </div>
  )
}

export const DocumentViewerOld: React.FC<DocumentViewerProps> = ({ document }) => {
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <FileX className="w-16 h-16 mb-4" />
        <p>Sélectionnez un document pour le visualiser</p>
      </div>
    )
  }

  if (document.type === 'folder') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p>Ce dossier contient {document.children?.length || 0} éléments</p>
      </div>
    )
  }

  // Déterminer le type de fichier basé sur l'extension
  const fileExtension = document.name.split('.').pop()?.toLowerCase()
  
  // Afficher le bon viewer en fonction du type de fichier
  if (fileExtension === 'pdf') {
    return (
      <div className="h-full">
        <FileViewer 
          file={{
            url: document.url || '',
            type: 'application/pdf',
            name: document.name
          }}
        />
      </div>
    )
  }

  if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
    return (
      <div className="h-full">
        <ImageViewer 
          images={[document.url || '']}
        />
      </div>
    )
  }

  // Pour les autres types de fichiers
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <p>Ce type de fichier ne peut pas être visualisé directement</p>
      <a 
        href={document.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline mt-2"
      >
        Télécharger le fichier
      </a>
    </div>
  )
} 