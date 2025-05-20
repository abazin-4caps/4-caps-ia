'use client';

import { useState } from 'react'
import { Document } from '@/types/document'
import { DocumentItem } from './document-item'

interface DocumentTreeProps {
  documents: Document[]
  selectedDocument: Document | null
  onSelectDocument: (document: Document) => void
}

export function DocumentTree({
  documents,
  selectedDocument,
  onSelectDocument,
}: DocumentTreeProps) {
  const renderDocuments = (docs: Document[], level: number = 0) => {
    return docs.map((doc) => (
      <DocumentItem
        key={doc.id}
        document={doc}
        level={level}
        onSelect={onSelectDocument}
        isSelected={selectedDocument?.id === doc.id}
      />
    ))
  }

  return (
    <div className="space-y-1">
      {renderDocuments(documents)}
    </div>
  )
} 