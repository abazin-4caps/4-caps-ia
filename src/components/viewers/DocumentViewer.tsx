import { FC } from 'react'
import { Document } from '@/types/document'
import { FileViewer } from '@/components/FileViewer'
import { ImageViewer } from '@/components/ImageViewer'
import { FileX } from 'lucide-react'

interface DocumentViewerProps {
  document: Document | null
}

export const DocumentViewer: FC<DocumentViewerProps> = ({ document }) => {
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
            url: document.file_url || '',
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
          images={[document.file_url || '']}
        />
      </div>
    )
  }

  // Pour les autres types de fichiers
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <p>Ce type de fichier ne peut pas être visualisé directement</p>
      <a 
        href={document.file_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline mt-2"
      >
        Télécharger le fichier
      </a>
    </div>
  )
} 