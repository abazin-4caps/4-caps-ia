'use client';

import React from 'react';
import { Document } from '@/types/document';
import { FolderTree, File as FileIcon, FolderOpen, FolderClosed } from "lucide-react"

interface DocumentTreeProps {
  documents: Document[];
  onSelect?: (document: Document | null) => void;
  onRefresh?: () => void;
}

export const DocumentTree: React.FC<DocumentTreeProps> = ({ documents, onSelect, onRefresh }) => {
  return (
    <div className="flex-1 overflow-auto">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelect?.(doc)}
        >
          {doc.type === 'folder' ? (
            <FolderClosed className="w-5 h-5 mr-2 text-yellow-500" />
          ) : (
            <FileIcon className="w-5 h-5 mr-2 text-blue-500" />
          )}
          <span>{doc.name}</span>
        </div>
      ))}
    </div>
  );
}; 