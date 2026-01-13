
import React, { useState, useEffect } from 'react';
import { RHK, Employee, Indicator } from '../types';
import { suggestInterventionRhk } from '../services/geminiService';
import { Wand2, X, Plus, Trash2, Save } from 'lucide-react';

interface RhkInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentRhk?: RHK | null; // Optional because top leader has no parent RHK
  employee: Employee;
  initialData?: RHK | null;
  onSave: (rhk: Partial<RHK>) => void;
}

const RhkInterventionModal: React.FC<RhkInterventionModalProps> = ({
  isOpen, onClose, parentRhk, employee, initialData, onSave
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    indicators: [] as Omit<Indicator, 'id'>[]
  });

  // Populate form if editing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          description: initialData.description,
          indicators: initialData.indicators.map(ind => ({ ...ind }))
        });
      } else {
        setFormData({
          title: '',
          description: '',
          indicators: []
        });
      }
    }
  }, [isOpen, initialData]);

  const handleAiSuggest = async () => {
    if (!parentRhk) return;
    setLoadingAi(true);
    const suggestion = await suggestInterventionRhk(parentRhk, employee.role, employee.position);
    if (suggestion) {
      setFormData({
        title: suggestion.suggestedTitle,
        description: suggestion.suggestedDescription,
        indicators: suggestion.indicators
      });
    }
    setLoadingAi(false);
  };

  const addIndicator = () => {
    setFormData(prev => ({
      ...prev,
      indicators: [...prev.indicators, { text: '', target: '', perspective: 'Kualitas' }]
    }));
  };

  const removeIndicator = (index: number) => {
    setFormData(prev => ({
      ...prev,
      indicators: prev.indicators.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isEditMode ? 'Edit Rencana Hasil Kerja' : 'Intervensi RHK Pimpinan'}
            </h3>
            <p className="text-sm text-slate-500">Pegawai: {employee.name} ({employee.position})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {parentRhk && (
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">RHK Pimpinan yang diintervensi</span>
              <p className="font-semibold text-slate-800 mt-1">{parentRhk.title}</p>
              <p className="text-xs text-slate-600 mt-1">{parentRhk.description}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-slate-700">Detail Rencana Hasil Kerja (RHK)</label>
            {parentRhk && (
              <button 
                onClick={handleAiSuggest}
                disabled={loadingAi}
                className="flex items-center space-x-2 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
              >
                <Wand2 size={14} />
                <span>{loadingAi ? 'Menganalisis...' : 'Optimasi AI'}</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase mb-1 block">Judul RHK</label>
              <input 
                type="text" 
                placeholder="Contoh: Terlaksananya evaluasi program kerja..."
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm bg-white text-black"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase mb-1 block">Deskripsi / Ruang Lingkup</label>
              <textarea 
                placeholder="Jelaskan detail capaian yang diharapkan..."
                rows={3}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm bg-white text-black"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-slate-700">Indikator Kinerja Individu (IKI)</label>
              <button 
                onClick={addIndicator}
                className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
              >
                <Plus size={14} />
                <span>Tambah IKI</span>
              </button>
            </div>
            
            {formData.indicators.length === 0 && (
              <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-sm text-slate-400 italic">Belum ada indikator ditambahkan</p>
              </div>
            )}

            <div className="grid gap-4">
              {formData.indicators.map((ind, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl space-y-3 relative border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                  <button 
                    onClick={() => removeIndicator(idx)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block">Uraian Indikator</label>
                      <input 
                        placeholder="Contoh: Persentase kesesuaian data"
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white text-black"
                        value={ind.text}
                        onChange={(e) => {
                          const newInds = [...formData.indicators];
                          newInds[idx].text = e.target.value;
                          setFormData(prev => ({ ...prev, indicators: newInds }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block">Target</label>
                      <input 
                        placeholder="100%"
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white text-black"
                        value={ind.target}
                        onChange={(e) => {
                          const newInds = [...formData.indicators];
                          newInds[idx].target = e.target.value;
                          setFormData(prev => ({ ...prev, indicators: newInds }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block">Aspek</label>
                      <select 
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white text-black"
                        value={ind.perspective}
                        onChange={(e) => {
                          const newInds = [...formData.indicators];
                          newInds[idx].perspective = e.target.value as any;
                          setFormData(prev => ({ ...prev, indicators: newInds }));
                        }}
                      >
                        <option>Kualitas</option>
                        <option>Kuantitas</option>
                        <option>Waktu</option>
                        <option>Biaya</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50/50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="px-8 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center space-x-2 active:scale-95"
          >
            <Save size={18} />
            <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan RHK'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RhkInterventionModal;
