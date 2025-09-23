"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast, Toaster } from "sonner";

const formatBytes = (bytes: number): string => {
  const k = 1024, sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + sizes[i];
};

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const maxSize = 10 * 1024 * 1024;

  const resetState = () => {
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      filesToUpload.forEach(f => formData.append("files", f));
      
      const res = await fetch("/api/files", { method: "POST", body: formData });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error("Erreur lors de l'upload", {
          description: data.error || "Upload échoué"
        });
      } else {
        toast.success("Upload réussi !", {
          description: `${filesToUpload.length} fichier(s) uploadé(s)`,
          action: {
            label: "Voir",
            onClick: () => router.refresh()
          }
        });
        router.refresh();
        onUploadComplete?.();
        setTimeout(resetState, 1000);
      }
    } catch (err) {
      toast.error("Erreur lors de l'upload", {
        description: "Une erreur inattendue s'est produite"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const addFiles = (newFiles: FileList) => {
    const validFiles = Array.from(newFiles).filter(f => f.size <= maxSize);
    if (validFiles.length !== newFiles.length) {
      toast.warning("Fichiers trop volumineux", {
        description: "Certains fichiers dépassent la limite de 10MB"
      });
    }
    const filesToAdd = validFiles.slice(0, 10);
    
    // Déclencher automatiquement l'upload
    if (filesToAdd.length > 0) {
      handleUpload(filesToAdd);
    }
  };

  const removeFile = (index: number) => {
    // Fonction conservée pour cohérence mais plus utilisée
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  return (
    <>
      <div className="space-y-4 max-w-lg mx-auto">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
            className="hidden"
            disabled={isUploading}
          />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 font-medium">
            {isUploading ? "Upload en cours..." : "Glissez vos fichiers ou cliquez ici"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Images & PDF • Max 10 • {formatBytes(maxSize)} max
          </p>
        </div>

        {isUploading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Upload en cours...</span>
          </div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </>
  );
}