import React from 'react';
import { WebsiteProject } from '../../types';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  project: WebsiteProject | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  project,
  onClose,
  onConfirm,
}) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#030407]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0D14] border border-red-500/30 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-bold font-heading text-white">Delete Website Project</h3>
        <p className="text-xs text-[#9299AB] mt-1 mb-6 leading-relaxed">
          Are you sure you want to permanently delete <strong className="text-white">"{project.name}"</strong>? This will remove all local files and history for this website. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(project.id);
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
