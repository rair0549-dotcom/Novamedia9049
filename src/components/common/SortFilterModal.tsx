/**
 * Nova Media - View Mode & Sorting Dialog
 * Faithfully inspired by Android Media Player folder/file view customization
 */

import React, { useState } from 'react';
import {
  FolderArchive,
  Files,
  Folder,
  List,
  LayoutGrid,
  ArrowDownAZ,
  Calendar,
  Clock,
  CircleDot,
  Film,
  HardDrive,
  Tv,
  FolderTree,
  Gauge,
  FileType2,
  Check,
} from 'lucide-react';
import { LayoutMode, SortConfig, SortField, SortOrder, ViewMode } from '../../types/media';

interface SortFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  layoutMode: LayoutMode;
  onSelectLayoutMode: (mode: LayoutMode) => void;
  sortConfig: SortConfig;
  onApplySort: (config: SortConfig) => void;
}

export const SortFilterModal: React.FC<SortFilterModalProps> = ({
  isOpen,
  onClose,
  viewMode,
  onSelectViewMode,
  layoutMode,
  onSelectLayoutMode,
  sortConfig,
  onApplySort,
}) => {
  const [tempSortField, setTempSortField] = useState<SortField>(sortConfig.field);
  const [tempSortOrder, setTempSortOrder] = useState<SortOrder>(sortConfig.order);
  const [tempViewMode, setTempViewMode] = useState<ViewMode>(viewMode);
  const [tempLayoutMode, setTempLayoutMode] = useState<LayoutMode>(layoutMode);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectViewMode(tempViewMode);
    onSelectLayoutMode(tempLayoutMode);
    onApplySort({ field: tempSortField, order: tempSortOrder });
    onClose();
  };

  const sortItems: { id: SortField; label: string; icon: React.ElementType }[] = [
    { id: 'title', label: 'Title', icon: ArrowDownAZ },
    { id: 'date', label: 'Date', icon: Calendar },
    { id: 'played_time', label: 'Played time', icon: Clock },
    { id: 'status', label: 'Status', icon: CircleDot },
    { id: 'length', label: 'Length', icon: Film },
    { id: 'size', label: 'Size', icon: HardDrive },
    { id: 'resolution', label: 'Resolution', icon: Tv },
    { id: 'path', label: 'Path', icon: FolderTree },
    { id: 'frame_rate', label: 'Frame rate', icon: Gauge },
    { id: 'type', label: 'Type', icon: FileType2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[#191F2A] border border-[#2B3442] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 overflow-y-auto space-y-6">
          {/* View Mode Section */}
          <div>
            <span className="text-sm font-semibold text-[#F4F7FC] block mb-3">View Mode</span>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTempViewMode('all_folders')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
                  tempViewMode === 'all_folders'
                    ? 'border-[#62B5FF] bg-[#62B5FF]/10 text-[#62B5FF]'
                    : 'border-[#2B3442] bg-[#11151D] text-[#A5AFBE] hover:text-[#F4F7FC]'
                }`}
              >
                <FolderArchive className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-medium">All folders</span>
              </button>

              <button
                onClick={() => setTempViewMode('files')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
                  tempViewMode === 'files'
                    ? 'border-[#62B5FF] bg-[#62B5FF]/10 text-[#62B5FF]'
                    : 'border-[#2B3442] bg-[#11151D] text-[#A5AFBE] hover:text-[#F4F7FC]'
                }`}
              >
                <Files className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-medium">Files</span>
              </button>

              <button
                onClick={() => setTempViewMode('folders')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${
                  tempViewMode === 'folders'
                    ? 'border-[#62B5FF] bg-[#62B5FF]/10 text-[#62B5FF]'
                    : 'border-[#2B3442] bg-[#11151D] text-[#A5AFBE] hover:text-[#F4F7FC]'
                }`}
              >
                <Folder className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-medium">Folders</span>
              </button>
            </div>
          </div>

          {/* Layout Section */}
          <div>
            <span className="text-sm font-semibold text-[#F4F7FC] block mb-3">Layout</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTempLayoutMode('list')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border transition-all ${
                  tempLayoutMode === 'list'
                    ? 'border-[#62B5FF] bg-[#62B5FF]/10 text-[#62B5FF]'
                    : 'border-[#2B3442] bg-[#11151D] text-[#A5AFBE] hover:text-[#F4F7FC]'
                }`}
              >
                <List className="w-5 h-5" />
                <span className="text-xs font-medium">List</span>
              </button>

              <button
                onClick={() => setTempLayoutMode('grid')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border transition-all ${
                  tempLayoutMode === 'grid'
                    ? 'border-[#62B5FF] bg-[#62B5FF]/10 text-[#62B5FF]'
                    : 'border-[#2B3442] bg-[#11151D] text-[#A5AFBE] hover:text-[#F4F7FC]'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="text-xs font-medium">Grid</span>
              </button>
            </div>
          </div>

          {/* Sort Section */}
          <div>
            <span className="text-sm font-semibold text-[#F4F7FC] block mb-3">Sort</span>
            <div className="grid grid-cols-5 gap-2.5">
              {sortItems.map(item => {
                const Icon = item.icon;
                const isSelected = tempSortField === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTempSortField(item.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[#62B5FF] bg-[#62B5FF]/10 text-[#62B5FF]'
                        : 'border-transparent bg-[#11151D] text-[#A5AFBE] hover:text-[#F4F7FC]'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Oldest / Newest Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#11151D] rounded-xl border border-[#2B3442] mt-3">
              <button
                onClick={() => setTempSortOrder('asc')}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  tempSortOrder === 'asc'
                    ? 'bg-[#62B5FF]/20 text-[#62B5FF] border border-[#62B5FF]/40'
                    : 'text-[#A5AFBE] hover:text-[#F4F7FC]'
                }`}
              >
                ↑ {tempSortField === 'title' ? 'A to Z' : 'Oldest'}
              </button>
              <button
                onClick={() => setTempSortOrder('desc')}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  tempSortOrder === 'desc'
                    ? 'bg-[#62B5FF]/20 text-[#62B5FF] border border-[#62B5FF]/40'
                    : 'text-[#A5AFBE] hover:text-[#F4F7FC]'
                }`}
              >
                ↓ {tempSortField === 'title' ? 'Z to A' : 'Newest'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#2B3442] bg-[#11151D]/60">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-[#A5AFBE] hover:text-[#F4F7FC] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 text-sm font-semibold text-[#090B10] bg-[#62B5FF] rounded-xl hover:bg-[#83c6ff] active:scale-95 transition-all shadow-lg shadow-[#62B5FF]/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
