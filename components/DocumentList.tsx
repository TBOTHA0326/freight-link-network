'use client';

import { FileText, Download, Check, X, Clock, Trash2 } from 'lucide-react';
import type { Document, DocumentStatus } from '@/database/types';
import { getDocumentUrl } from '@/database/queries/documents';
import { useState } from 'react';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (documentId: string) => Promise<void>;
  onApprove?: (documentId: string) => Promise<void>;
  onReject?: (documentId: string, reason: string) => Promise<void>;
  showActions?: boolean;
  isAdmin?: boolean;
}

const statusConfig: Record<DocumentStatus, { icon: React.ReactNode; label: string; className: string }> = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800',
  },
  approved: {
    icon: <Check className="w-4 h-4" />,
    label: 'Approved',
    className: 'bg-green-100 text-green-800',
  },
  rejected: {
    icon: <X className="w-4 h-4" />,
    label: 'Rejected',
    className: 'bg-red-100 text-red-800',
  },
};

export default function DocumentList({
  documents,
  onDelete,
  onApprove,
  onReject,
  showActions = true,
  isAdmin = false,
}: DocumentListProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleDownload = async (doc: Document) => {
    setDownloading(doc.id);
    try {
      const url = await getDocumentUrl(doc.file_path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!onDelete) return;
    
    setDeleting(documentId);
    try {
      await onDelete(documentId);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleReject = async () => {
    if (!onReject || !rejectModal) return;
    
    try {
      await onReject(rejectModal, rejectReason);
      setRejectModal(null);
      setRejectReason('');
    } catch (error) {
      console.error('Reject failed:', error);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => {
          const status = statusConfig[doc.status];
          
          return (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <FileText className="w-8 h-8 text-[#06082C] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                  <p className="text-sm text-gray-500 truncate">{doc.file_name}</p>
                  {doc.rejection_reason && (
                    <p className="text-sm text-[#9B2640] mt-1">
                      Reason: {doc.rejection_reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                >
                  {status.icon}
                  {status.label}
                </span>

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center gap-2">
                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                      className="p-2 text-gray-500 hover:text-[#06082C] transition-colors disabled:opacity-50"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Admin Actions */}
                    {isAdmin && doc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove?.(doc.id)}
                          className="p-2 text-green-600 hover:text-green-700 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRejectModal(doc.id)}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Delete Button */}
                    {onDelete && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting === doc.id}
                        className="p-2 text-gray-400 hover:text-[#9B2640] transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Document
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06082C] focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-[#9B2640] text-white rounded-lg hover:bg-[#7a1e33] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
