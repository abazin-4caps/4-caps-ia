"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast as hotToast } from 'react-hot-toast';
import { FolderTree, File as FileIcon, FolderOpen, FolderClosed, Plus, Download, Pencil, Trash2, Folder, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Document } from "@/types/document"
import { getProjectDocuments, createDocument, updateDocument, deleteDocument } from "@/lib/documents"
import { useToast } from "@/components/ui/use-toast"
import { supabase as supabaseClient } from "@/lib/supabase"
import { DocumentTree } from "@/components/documents/document-tree"

interface DocumentsPanelProps {
  projectId: string;
  onDocumentSelect?: (document: Document | null) => void;
}

const DocumentsPanel = ({ projectId, onDocumentSelect }: DocumentsPanelProps) => {
  const [docData, setDocData] = useState({ id: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const { toast } = useToast();
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)

  const refreshDocuments = async () => {
    try {
      const docs = await getProjectDocuments(projectId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    refreshDocuments();
  }, [projectId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadSingleFile = async (file: File) => {
      try {
        setUploadingFiles((prev: Record<string, number>) => ({
          ...prev,
          [file.name]: 0
        }));

        const { data: docData, error: docError } = await supabaseClient
          .from('documents')
          .insert({
            name: file.name,
            type: 'file',
            project_id: projectId,
            parent_id: null,
          })
          .select()
          .single();

        if (docError) throw docError;

        const filePath = `${projectId}/${docData.id}/${file.name}`;
        const { error: uploadError, data } = await supabaseClient.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        setUploadingFiles((prev: Record<string, number>) => ({
          ...prev,
          [file.name]: 100
        }));

        const { error: updateError } = await supabaseClient
          .from('documents')
          .update({ path: filePath })
          .eq('id', docData.id);

        if (updateError) throw updateError;

        const { data: { publicUrl } } = await supabaseClient
          .storage
          .from('documents')
          .getPublicUrl(filePath);

        const { error: finalUpdateError } = await supabaseClient
          .from('documents')
          .update({ url: publicUrl })
          .eq('id', docData.id);

        if (finalUpdateError) throw finalUpdateError;

        refreshDocuments();

        toast({
          title: "Succès",
          description: `${file.name} a été uploadé avec succès`,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Erreur",
          description: `Erreur lors de l'upload de ${file.name}`,
          variant: "destructive",
        });
      } finally {
        setUploadingFiles((prev: Record<string, number>) => {
          const newState = { ...prev };
          delete newState[file.name];
          return newState;
        });
      }
    };

    const fileArray = Array.from(files) as File[];
    for (const file of fileArray) {
      await uploadSingleFile(file);
    }
  };

  const handleCreateFolder = async (parentId: string | null = null) => {
    setSelectedParentId(parentId)
    setNewFolderName("")
    setIsCreateFolderOpen(true)
  }

  return (
    <div className="h-full p-4">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          <Input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            multiple
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </span>
            </Button>
          </label>
        </div>
        
        <DocumentTree
          documents={documents}
          onSelect={onDocumentSelect}
          onRefresh={refreshDocuments}
        />
      </div>
    </div>
  );
};

export default DocumentsPanel; 