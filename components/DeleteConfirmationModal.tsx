
import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, message, itemName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-600" size={40} />
          </div>
          
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            {message}
          </p>
          
          {itemName && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Item yang dipilih</p>
              <p className="text-sm font-bold text-slate-700 truncate">{itemName}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              Batalkan
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <Trash2 size={16} />
              <span>Hapus Data</span>
            </button>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
