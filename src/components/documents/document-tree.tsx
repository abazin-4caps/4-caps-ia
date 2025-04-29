import { FC, useState } from 'react'
import { Document } from '@/types/document'
import { DocumentItem } from './document-item'

interface DocumentTreeProps {
  documents: Document[]
  selectedDocument?: Document | null
  onSelectDocument: (doc: Document) => void
}

export const DocumentTree: FC<DocumentTreeProps> = ({
  documents,
  selectedDocument,
  onSelectDocument,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (doc: Document) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(doc.id)) {
      newExpanded.delete(doc.id)
    } else {
      newExpanded.add(doc.id)
    }
    setExpandedFolders(newExpanded)
  }

  const renderDocuments = (docs: Document[], depth: number = 0) => {
    return docs.map((doc) => (
      <div key={doc.id}>
        <DocumentItem
          document={doc}
          isSelected={selectedDocument?.id === doc.id}
          isExpanded={expandedFolders.has(doc.id)}
          depth={depth}
          onSelect={onSelectDocument}
          onToggleExpand={toggleFolder}
        />
        {doc.type === 'folder' &&
          expandedFolders.has(doc.id) &&
          doc.children &&
          renderDocuments(doc.children, depth + 1)}
      </div>
    ))
  }

  return <div className="w-full">{renderDocuments(documents)}</div>
} 