'use client';

import { useState, useEffect } from 'react';
import { Document } from '@/types/document';
import { ChevronRight, File, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface DocumentItemProps {
  document: Document;
  level?: number;
  onSelect?: (document: Document) => void;
  isSelected?: boolean;
}

export function DocumentItem({
  document,
  level = 0,
  onSelect,
  isSelected = false,
}: DocumentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isFolder = document.type === 'folder';
  const hasChildren = isFolder && document.children && document.children.length > 0;

  useEffect(() => {
    const checkFileAccess = async () => {
      if (!document.path || document.type === 'folder') return;

      try {
        const { data, error } = await supabase
          .storage
          .from('documents')
          .createSignedUrl(document.path, 60);

        if (error) {
          console.error('Error checking file access:', error);
          setHasError(true);
        }
      } catch (error) {
        console.error('Error checking file access:', error);
        setHasError(true);
      }
    };

    checkFileAccess();
  }, [document]);

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    }
    if (onSelect && !hasError) {
      onSelect(document);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100',
          isSelected && 'bg-blue-50 hover:bg-blue-100',
          hasError && 'opacity-50 cursor-not-allowed'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        <ChevronRight
          className={cn(
            'h-4 w-4 transition-transform',
            isExpanded && 'transform rotate-90',
            !isFolder && 'invisible'
          )}
        />
        {isFolder ? (
          <Folder className="h-4 w-4 text-blue-500" />
        ) : (
          <File className="h-4 w-4 text-gray-500" />
        )}
        <span className={cn('text-sm', hasError && 'text-gray-400')}>
          {document.name}
        </span>
      </div>

      {isExpanded && hasChildren && document.children && (
        <div>
          {document.children.map((child) => (
            <DocumentItem
              key={child.id}
              document={child}
              level={level + 1}
              onSelect={onSelect}
              isSelected={isSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
} 