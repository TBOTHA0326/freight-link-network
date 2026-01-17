'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, Image, AlertCircle } from 'lucide-react';
import type { DocumentCategory } from '@/database/types';

interface DocumentUploadProps {
  category: DocumentCategory;
  title: string;
  onUpload: (file: File, title: string) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
}

export default function DocumentUpload({
  category,
  title,
  onUpload,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize = 10,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState(title);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      setError(`File type ${fileExt} is not allowed`);
      return false;
    }

    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, [maxSize, accept]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(selectedFile, customTitle);
      setSelectedFile(null);
      setCustomTitle(title);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = selectedFile?.type.startsWith('image/');

  return (
    <div className="space-y-4">
      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Title
        </label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent"
          placeholder="Enter document title"
        />
      </div>

      {/* Upload Zone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#06082C] bg-blue-50'
              : 'border-gray-300 hover:border-[#06082C]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-10 h-10 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            <span className="font-medium text-[#06082C]">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} (Max {maxSize}MB)
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            {isImage ? (
              <Image className="w-10 h-10 text-[#06082C]" />
            ) : (
              <FileText className="w-10 h-10 text-[#06082C]" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-[#9B2640] text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading || !customTitle.trim()}
          className="w-full px-4 py-2 rounded-lg font-medium bg-[#06082C] text-white hover:bg-[#0a0e40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      )}
    </div>
  );
}
