
import React, { useState } from 'react';
import { Employee, RHK, Role } from '../types';
import { Clock, Search, User, Target, Plus, ChevronRight, ChevronDown, LayoutList, GitBranchPlus, Trash2, Edit2, Info, AlertCircle, Shield } from 'lucide-react';
import RhkInterventionModal from '../components/RhkInterventionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface PartTimeRhkManagementProps {
  employees: Employee[];
  rhks: RHK[];
  onSaveRhkRemote: (rhkData: Partial<RHK>, employeeId: string, parentRhkId?: string) => Promise<void>;
  onDeleteRhkRemote: (id: string) => Promise<void>;
}

const PartTimeRhkManagement: React.FC<PartTimeRhkManagementProps> = ({ employees, rhks, onSaveRhkRemote, onDeleteRhkRemote }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderSearchTerm, setLeaderSearchTerm] = useState('');
  const [selectedLeaderRhkId, setSelectedLeaderRhkId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState<Employee | null>(null);
  const [editingRhk, setEditingRhk] = useState<RHK | null>(null);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, rhkId: string | null}>({isOpen: false, rhkId: null});
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

  const sekda = employees.find(e => e.role === Role.SEKDA);
  const sekdaRhks = sekda ? rhks.filter(r => r.employeeId === sekda.id && r.title.toLowerCase().includes(leaderSearchTerm.toLowerCase())) : [];
  
  const partTimeEmployees = employees.filter(e => 
    e.isPartTime && 
    (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.nip.includes(searchTerm))
  );

  const handleIntervene = (emp: Employee) => {
    if (!selectedLeaderRhkId) {
      alert("Silakan pilih RHK Pimpinan (SEKDA) terlebih dahulu sebagai acuan intervensi.");
      return;
    }
    setTargetEmployee(emp);
    setEditingRhk(null);
    setIsModalOpen(true);
  };

  const handleEditRhk = (emp: Employee, rhk: RHK) => {
    setTargetEmployee(emp);
    setEditingRhk(rhk);
    setIsModalOpen(true);
  };

  const handleSaveRhk = async (formData: Partial<RHK>) => {
    if (!targetEmployee) return;
    // Jika edit, gunakan parentRhkId yang lama, jika baru gunakan yang terpilih
    const parentId = editingRhk ? editingRhk.parentRhkId : selectedLeaderRhkId;
    await onSaveRhkRemote({ ...formData, id: editingRhk?.id }, targetEmployee.id, parentId || undefined);
    setIsModalOpen(false);
    setEditingRhk(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, rhkId: id });
  };

  const confirmDelete = async () => {
    if (deleteModal.rhkId) {
      await onDeleteRhkRemote(deleteModal.rhkId);
      setDeleteModal({ isOpen: false, rhkId: null });
    }
  };

  const selectedLeaderRhk = rhks.find(r => r.id === selectedLeaderRhkId);

  return (
    <div className="max-w-[1600px] mx-auto px-8 md:px-12 lg:px-16 py-10 md:py-16 space-y-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <Shield size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kinerja PPPK Paruh Waktu</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Pengelolaan RHK cascading dari pimpinan (SEKDA) untuk tenaga penunjang.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl border border-indigo-100 text-[11px] font-black uppercase tracking-[0.1em]">
          <Clock size={16} />
          <span>Fokus Distribusi Target Pimpinan</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Step 1: Leader Selection (Left Panel) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px] -mr-20 -mt-20"></div>
            
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <LayoutList size={22} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">1. Acuan Pimpinan</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Sekretaris Daerah</p>
              </div>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Cari RHK SEKDA..." 
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all shadow-inner"
                value={leaderSearchTerm}
                onChange={e => setLeaderSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar-mini pr-2">
              {sekdaRhks.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-white/10 rounded-3xl text-center">
                  <AlertCircle className="mx-auto text-slate-600 mb-3" size={28} />
                  <p className="text-xs text-slate-500 italic">Belum ada RHK SEKDA yang sesuai kriteria.</p>
                </div>
              ) : (
                sekdaRhks.map(rhk => (
                  <button
                    key={rhk.id}
                    onClick={() => setSelectedLeaderRhkId(rhk.id)}
                    className={`w-full text-left p-5 rounded-[1.75rem] border transition-all duration-300 group ${
                      selectedLeaderRhkId === rhk.id 
                      ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-500/20 scale-[1.02]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${selectedLeaderRhkId === rhk.id ? 'bg-white/20' : 'bg-slate-800'}`}>
                        UTAMA
                      </span>
                      {selectedLeaderRhkId === rhk.id && <ChevronRight size={16} className="text-white" />}
                    </div>
                    <p className={`text-xs font-bold leading-relaxed ${selectedLeaderRhkId === rhk.id ? 'text-white' : 'text-slate-300'}`}>
                      {rhk.title}
                    </p>
                    <div className="mt-4 flex items-center space-x-3">
                      <div className={`p-1.5 rounded-lg ${selectedLeaderRhkId === rhk.id ? 'bg-white/20' : 'bg-slate-800 text-slate-400'}`}>
                        <Target size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {rhk.indicators.length} Indikator Kinerja
                      </span>
                    </div>
                  </button>
                ))}
              )}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2rem] flex items-start space-x-5 shadow-sm">
            <Info className="text-indigo-600 shrink-0 mt-1" size={24} />
            <div className="space-y-2">
              <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Petunjuk Penggunaan</p>
              <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                Pilih satu RHK pimpinan di sebelah kiri, kemudian cari pegawai di sebelah kanan untuk melakukan <b>Intervensi Kinerja</b>.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Employee List & RHK Management (Right Panel) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center space-x-4">
                <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 text-indigo-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">2. Daftar PPPK Paruh Waktu</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Kelola target kinerja individu di bawah pimpinan SEKDA.</p>
                </div>
              </div>
              
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Cari Nama atau NIP Pegawai..." 
                  className="w-full md:w-80 pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-[0.15em] border-b border-slate-100">
                    <th className="px-10 py-5">Informasi Pegawai</th>
                    <th className="px-10 py-5">Status RHK</th>
                    <th className="px-10 py-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {partTimeEmployees.map(emp => {
                    const empRhks = rhks.filter(r => r.employeeId === emp.id);
                    const isExpanded = expandedEmployeeId === emp.id;
                    
                    return (
                      <React.Fragment key={emp.id}>
                        <tr className={`hover:bg-slate-50 transition-colors group ${isExpanded ? 'bg-slate-50/80' : ''}`}>
                          <td className="px-10 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <User size={24} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-slate-800 text-base">{emp.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono tracking-tighter">{emp.nip} • {emp.position}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            {empRhks.length > 0 ? (
                              <button 
                                onClick={() => setExpandedEmployeeId(isExpanded ? null : emp.id)}
                                className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-tight hover:bg-emerald-100 transition-colors"
                              >
                                <span>{empRhks.length} RHK Aktif</span>
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                            ) : (
                              <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-4 py-1.5 rounded-xl border border-slate-200">
                                Belum Ada RHK
                              </span>
                            )}
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button 
                              onClick={() => handleIntervene(emp)}
                              disabled={!selectedLeaderRhkId}
                              className={`flex items-center space-x-2 ml-auto px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all ${
                                selectedLeaderRhkId 
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                            >
                              <GitBranchPlus size={18} />
                              <span>Intervensi</span>
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Section for Existing RHKs */}
                        {isExpanded && (
                          <tr className="bg-white/50">
                            <td colSpan={3} className="px-10 py-8 border-b border-slate-100">
                              <div className="space-y-4">
                                <div className="flex items-center space-x-3 mb-6">
                                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Target Kerja Terdata</h4>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {empRhks.map(rhk => (
                                    <div key={rhk.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-300 transition-colors group/rhk">
                                      <div className="flex justify-between items-start mb-4">
                                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-tight">
                                          {rhk.type}
                                        </span>
                                        <div className="flex space-x-1 opacity-0 group-hover/rhk:opacity-100 transition-opacity">
                                          <button onClick={() => handleEditRhk(emp, rhk)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 size={14} />
                                          </button>
                                          <button onClick={() => handleDeleteClick(rhk.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                      <h5 className="text-sm font-black text-slate-800 leading-snug mb-2">{rhk.title}</h5>
                                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">{rhk.description}</p>
                                      
                                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
                                          <Target size={12} />
                                          <span>{rhk.indicators.length} Indikator</span>
                                        </div>
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full ${
                                          rhk.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                          {rhk.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {partTimeEmployees.length === 0 && (
                <div className="flex flex-col items-center justify-center p-40 text-center">
                  <div className="bg-slate-50 w-28 h-28 rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                    <User className="text-slate-300" size={56} />
                  </div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">Pegawai Tidak Ditemukan</h4>
                  <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
                    Coba ubah kata kunci pencarian atau pastikan status <b>Paruh Waktu</b> sudah diatur di menu Pegawai.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && targetEmployee && (
        <RhkInterventionModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingRhk(null); }}
          parentRhk={selectedLeaderRhk}
          employee={targetEmployee}
          initialData={editingRhk}
          onSave={handleSaveRhk}
        />
      )}

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({isOpen: false, rhkId: null})}
        onConfirm={confirmDelete}
        title="Hapus Rencana Kerja?"
        message="Data ini akan dihapus permanen dari sistem kinerja pegawai."
      />

      <style>{`
        .custom-scrollbar-mini::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default PartTimeRhkManagement;
