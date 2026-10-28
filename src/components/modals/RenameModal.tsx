import React, { useState } from 'react';
import { WebsiteProject } from '../../types';
import { X, Pencil } from 'lucide-react';

interface RenameModalProps {
  project: WebsiteProject | null;
  onClose: () => void;
  onRename: (id: string, newName: string) => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  project,
  onClose,
  onRename,
}) => {
  if (!project) return null;
  const [name, setName] = useState(project.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(project.id, name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030407]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0D14] border border-white/15 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Pencil className="w-4 h-4 text-[#D4FF24]" />
          <h3 className="text-lg font-bold font-heading text-white">Rename Website</h3>
        </div>
        <p className="text-xs text-[#9299AB] mb-5">Change the display title for this project.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#101521] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4FF24]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#D4FF24] text-[#030407] font-bold text-xs hover:opacity-90 transition"
            >
              Save Name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
