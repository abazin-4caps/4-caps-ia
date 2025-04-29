import { FC } from 'react'
import { Document } from '@/types/document'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FolderIcon, FileIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react'

interface DocumentItemProps {
  document: Document
  isSelected: boolean
  isExpanded?: boolean
  depth: number
  onSelect: (doc: Document) => void
  onToggleExpand?: (doc: Document) => void
}

export const DocumentItem: FC<DocumentItemProps> = ({
  document,
  isSelected,
  isExpanded,
  depth,
  onSelect,
  onToggleExpand
}) => {
  const isFolder = document.type === 'folder'
  const hasChildren = isFolder && document.children && document.children.length > 0

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors',
        isSelected && 'bg-slate-100',
        'ml-' + (depth * 4)
      )}
      onClick={() => onSelect(document)}
    >
      {isFolder && hasChildren && (
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.(document)
          }}
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </Button>
      )}
      {isFolder ? (
        <FolderIcon className="h-4 w-4 text-blue-500" />
      ) : (
        <FileIcon className="h-4 w-4 text-gray-500" />
      )}
      <span className="text-sm">{document.name}</span>
    </div>
  )
} 