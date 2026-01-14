
import React, { useState, useRef } from 'react';
import { RHK, Employee, Role } from '../types';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, User, Target, Share2, MoreHorizontal, Shield, AlertCircle, ZoomIn, ZoomOut, Maximize, Hand, MousePointer2, Clock, ListChecks, Activity } from 'lucide-react';
import RhkInterventionModal from '../components/RhkInterventionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface RhkDiagramNodeProps { 
  rhk: RHK; 
  level: number;
  employees: Employee[];
  rhks: RHK[];
  expandedRhkIds: Set<string>;
  activeMenuId: string | null;
  onToggleRhk: (id: string) => void;
  onSetActiveMenu: (id: string | null) => void;
  onEdit: (rhk: RHK, emp: Employee) => void;
  onDelete: (rhk: RHK) => void;
  onAddIntervention: (parent: RHK, sub: Employee) => void;
}

const RhkDiagramNode: React.FC<RhkDiagramNodeProps> = ({ 
  rhk, level, employees, rhks, expandedRhkIds, activeMenuId,
  onToggleRhk, onSetActiveMenu, onEdit, onDelete, onAddIntervention 
}) => {
  const owner = employees.find(e => e.id === rhk.employeeId);
  const childRhks = rhks.filter(r => r.parentRhkId === rhk.id);
  
  const subordinates = owner ? employees.filter(e => e.superiorId === owner.id) : [];
  
  const isExpanded = expandedRhkIds.has(rhk.id);
  const isMenuOpen = activeMenuId === rhk.id;

  if (!owner) return null;

  const getCardBorder = (role: Role) => {
    switch(role) {
      case Role.SEKDA: return 'border-purple-500 ring-4 ring-purple-50';
      case Role.ASISTEN: return 'border-blue-500 ring-2 ring-blue-50';
      case Role.KABAG: return 'border-emerald-500';
      case Role.KASUBAG: return 'border-amber-500';
      default: return 'border-slate-200';
    }
  };

  const getPerspectiveColor = (p: string) => {
    switch(p) {
      case 'Kualitas': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Kuantitas': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Waktu': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Biaya': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const cardWidth = 340; 

  return (
    <div className="flex flex-col items-center shrink-0">
      <div className={`relative bg-white border-2 rounded-[1.5rem] shadow-xl transition-all z-10 hover:shadow-2xl overflow-hidden ${getCardBorder(owner.role)}`} style={{ width: `${cardWidth}px` }}>
        {/* Header Pegawai */}
        <div className="p-3 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/80 backdrop-blur-sm">
          <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
            {owner.isPartTime ? <Clock size={16} className="text-indigo-500" /> : <User size={16} />}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center space-x-2 overflow-hidden">
               <p className="text-[11px] font-black text-slate-800 truncate leading-tight uppercase tracking-tight">{owner.name}</p>
               {owner.isPartTime && <span className="text-[8px] font-black text-white bg-indigo-500 px-1.5 py-0.5 rounded-lg uppercase tracking-tighter shrink-0 shadow-sm">PARUH WAKTU</span>}
            </div>
            <p className="text-[9px] text-slate-500 truncate uppercase font-bold leading-tight mt-0.5">{owner.position}</p>
          </div>
        </div>

        {/* Konten Utama RHK & Indikator */}
        <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar-mini">
          {/* Judul RHK */}
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 mb-1.5">
              <Activity size={12} className="text-blue-500" />
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Rencana Hasil Kerja</span>
            </div>
            <h4 className="text-[13px] font-black text-slate-900 leading-[1.3] tracking-tight">
              {rhk.title}
            </h4>
            {rhk.description && (
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100/50 mt-2">
                {rhk.description}
              </p>
            )}
          </div>
          
          {/* Daftar Indikator Lengkap */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <ListChecks size={12} className="text-emerald-500" />
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Indikator Kinerja Individu ({rhk.indicators.length})</span>
            </div>
            
            <div className="space-y-2">
              {rhk.indicators.length > 0 ? (
                rhk.indicators.map((ind, idx) => (
                  <div key={ind.id} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors">
                    <p className="text-[11px] font-bold text-slate-700 leading-snug mb-2">{ind.text}</p>
                    <div className="flex items-center justify-between">
                      <div className={`text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPerspectiveColor(ind.perspective)}`}>
                        {ind.perspective}
                      </div>
                      <div className="flex items-center space-x-1.5 bg-slate-900 text-white px-2.5 py-0.5 rounded-lg shadow-inner">
                        <Target size={10} className="text-blue-400" />
                        <span className="text-[10px] font-black tabular-nums">{ind.target}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <span className="text-[10px] text-slate-300 font-bold italic">Belum ada indikator</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Aksi */}
        <div className="px-4 py-2.5 bg-slate-50/50 rounded-b-[1.5rem] border-t border-slate-100 flex items-center justify-between relative">
          <div className="flex space-x-1.5">
            <button onClick={(e) => { e.stopPropagation(); onEdit(rhk, owner); }} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors pointer-events-auto" title="Edit RHK">
              <Edit2 size={13} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(rhk); }} className="p-1.5 hover:bg-red-100 text-red-500 rounded-xl transition-colors pointer-events-auto" title="Hapus RHK">
              <Trash2 size={13} />
            </button>
          </div>

          <div className="flex items-center space-x-2 pointer-events-auto">
            {subordinates.length > 0 && (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActiveMenu(isMenuOpen ? null : rhk.id);
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center space-x-1.5"
                >
                  <Plus size={12} className="text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Intervensi</span>
                </button>
                
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => onSetActiveMenu(null)}></div>
                    <div className="absolute bottom-full right-0 mb-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="p-3 bg-slate-900 text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center justify-between border-b border-white/5">
                        <span>Pilih Bawahan</span>
                        <MoreHorizontal size={12} />
                      </div>
                      <div className="max-h-56 overflow-y-auto custom-scrollbar-mini">
                        {subordinates.map(sub => (
                          <button 
                            key={sub.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddIntervention(rhk, sub);
                              onSetActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 text-[11px] font-bold text-slate-700 border-b border-slate-50 last:border-0 flex items-center space-x-3 transition-colors"
                          >
                            <div className={`p-1.5 rounded-lg shrink-0 ${sub.isPartTime ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400'}`}>
                              {sub.isPartTime ? <Clock size={12} /> : <User size={12} />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate flex items-center gap-1.5">
                                {sub.name}
                                {sub.isPartTime && <span className="text-[7px] bg-indigo-100 text-indigo-600 px-1 rounded font-black">PT</span>}
                              </p>
                              <p className="text-[9px] text-slate-400 font-bold truncate uppercase mt-0.5">{sub.position}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {childRhks.length > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleRhk(rhk.id); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all shadow-md ${
                  isExpanded ? 'bg-slate-200 text-slate-700' : 'bg-emerald-600 text-white'
                }`}
              >
                <span>{isExpanded ? 'Tutup' : `Buka (${childRhks.length})`}</span>
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && childRhks.length > 0 && (
        <div className="relative pt-12 flex flex-col items-center">
          <div className="absolute top-0 w-0.5 h-12 bg-slate-300 shadow-sm"></div>
          
          <div className="flex flex-nowrap gap-16 items-start relative">
            {childRhks.map((child, idx) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {childRhks.length > 1 && (
                  <div className={`absolute top-0 h-0.5 bg-slate-300 transition-all ${
                    idx === 0 ? 'left-1/2 right-0' : 
                    idx === childRhks.length - 1 ? 'left-0 right-1/2' : 
                    'left-0 right-0'
                  }`} />
                )}
                
                <div className="w-0.5 h-12 bg-slate-300 shadow-sm"></div>
                
                <RhkDiagramNode 
                  rhk={child} 
                  level={level + 1}
                  employees={employees}
                  rhks={rhks}
                  expandedRhkIds={expandedRhkIds}
                  activeMenuId={activeMenuId}
                  onToggleRhk={onToggleRhk}
                  onSetActiveMenu={onSetActiveMenu}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddIntervention={onAddIntervention}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface CascadingMatrixProps {
  employees: Employee[];
  rhks: RHK[];
  onUpdateRhks: (newRhks: RHK[]) => void;
  onUpdateEmployees: (newEmployees: Employee[]) => void;
  onSaveRhkRemote: (rhkData: Partial<RHK>, employeeId: string, parentRhkId?: string) => Promise<void>;
  onDeleteRhkRemote: (id: string) => Promise<void>;
}

const CascadingMatrix: React.FC<CascadingMatrixProps> = ({ 
  employees, 
  rhks, 
  onSaveRhkRemote,
  onDeleteRhkRemote
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, rhk: RHK | null}>({isOpen: false, rhk: null});
  const [selectedParent, setSelectedParent] = useState<RHK | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingRhk, setEditingRhk] = useState<RHK | null>(null);
  const [expandedRhkIds, setExpandedRhkIds] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const [scale, setScale] = useState(0.85); // Default zoom sedikit lebih kecil agar lebih banyak kartu terlihat
  const [isHandTool, setIsHandTool] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleRhk = (id: string) => {
    const newSet = new Set(expandedRhkIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRhkIds(newSet);
  };

  const handleOpenIntervention = (parent: RHK, sub: Employee) => {
    setSelectedParent(parent);
    setSelectedEmployee(sub);
    setEditingRhk(null);
    setIsModalOpen(true);
  };

  const handleOpenEditRhk = (rhk: RHK, employee: Employee) => {
    const parent = rhks.find(r => r.id === rhk.parentRhkId) || null;
    setSelectedParent(parent);
    setSelectedEmployee(employee);
    setEditingRhk(rhk);
    setIsModalOpen(true);
  };

  const handleOpenAddTopRhk = (employee: Employee) => {
    setSelectedParent(null);
    setSelectedEmployee(employee);
    setEditingRhk(null);
    setIsModalOpen(true);
  };

  const confirmDeleteRhk = async () => {
    if (!deleteModal.rhk) return;
    await onDeleteRhkRemote(deleteModal.rhk.id);
    setDeleteModal({isOpen: false, rhk: null});
  };

  const handleSaveRhk = async (formData: Partial<RHK>) => {
    if (!selectedEmployee) return;
    await onSaveRhkRemote({ ...formData, id: editingRhk?.id }, selectedEmployee.id, selectedParent?.id);
    setIsModalOpen(false);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.2));
  const handleResetZoom = () => setScale(1.0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isHandTool || !containerRef.current) return;
    setIsDragging(true);
    setDragStart({ x: e.pageX, y: e.pageY, scrollLeft: containerRef.current.scrollLeft, scrollTop: containerRef.current.scrollTop });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const walkX = (e.pageX - dragStart.x);
    const walkY = (e.pageY - dragStart.y);
    containerRef.current.scrollLeft = dragStart.scrollLeft - walkX;
    containerRef.current.scrollTop = dragStart.scrollTop - walkY;
  };

  const handleMouseUp = () => setIsDragging(false);

  // Cari pimpinan tertinggi (SEKDA)
  const topLeaders = employees.filter(e => e.role === Role.SEKDA);

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col overflow-hidden">
      <div className="px-8 md:px-12 lg:px-16 py-10 md:py-12 shrink-0 bg-white/80 backdrop-blur-md z-20 border-b border-slate-100">
        <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Diagram Cascading SKP</h1>
            <p className="text-slate-500 text-sm font-medium">Visualisasi tunggal hierarki kinerja dari pimpinan ke seluruh struktur organisasi daerah.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-indigo-50 text-indigo-700 px-5 py-3 rounded-2xl border border-indigo-100 text-[11px] font-black uppercase tracking-[0.1em]">
              <Clock size={16} />
              <span>Full Integrated System</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto p-20 custom-scrollbar outline-none ${
          isHandTool ? (isDragging ? 'cursor-grabbing select-none' : 'cursor-grab') : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="transition-transform duration-200 ease-out origin-top-left flex flex-col items-start min-w-max" 
          style={{ transform: `scale(${scale})` }}
        >
          <div className="pb-96 pr-96 pl-20 pt-12">
            <div className="flex flex-col items-start space-y-24">
              {topLeaders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center max-w-2xl mx-auto shadow-sm">
                  <div className="bg-slate-50 w-28 h-28 rounded-[2.25rem] flex items-center justify-center mb-10 shadow-inner">
                    <Shield className="text-slate-300" size={56} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Inisialisasi Dibutuhkan</h3>
                  <p className="text-slate-500 text-base leading-relaxed mb-10">
                    Data atasan tertinggi (<b>SEKDA</b>) tidak ditemukan dalam sistem. Harap daftarkan pegawai dengan role SEKDA terlebih dahulu melalui menu Manajemen Pegawai.
                  </p>
                </div>
              ) : (
                topLeaders.map(topLeader => {
                  const topRhks = rhks.filter(r => r.employeeId === topLeader.id && !r.parentRhkId);
                  return (
                    <div key={topLeader.id} className="flex flex-col items-start space-y-20 pl-10">
                      <div className="bg-slate-900 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center space-x-6 border-4 border-white shrink-0 self-start hover:scale-[1.02] transition-transform duration-300">
                        <div className="bg-blue-600/20 p-4 rounded-[1.5rem] border border-white/10 shadow-inner">
                          <Share2 size={26} className="text-blue-400" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                          <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-2.5">Puncak Hierarki (SEKDA)</span>
                          <span className="text-xl font-black tracking-tight">{topLeader.name}</span>
                          <span className="text-[12px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">Sekretaris Daerah Kab/Kota</span>
                        </div>
                        <button 
                          onClick={() => handleOpenAddTopRhk(topLeader)}
                          className="ml-8 bg-blue-600 hover:bg-blue-700 p-3 rounded-[1.25rem] transition-all active:scale-90 shadow-xl shadow-blue-500/30"
                          title="Tambah RHK Pimpinan"
                        >
                          <Plus size={24} />
                        </button>
                      </div>

                      <div className="flex flex-nowrap justify-start gap-20 items-start pl-8">
                        {topRhks.map(rhk => (
                          <RhkDiagramNode 
                            key={rhk.id} 
                            rhk={rhk} 
                            level={0}
                            employees={employees}
                            rhks={rhks}
                            expandedRhkIds={expandedRhkIds}
                            activeMenuId={activeMenuId}
                            onToggleRhk={toggleRhk}
                            onSetActiveMenu={setActiveMenuId}
                            onEdit={handleOpenEditRhk}
                            onDelete={(r) => setDeleteModal({isOpen: true, rhk: r})}
                            onAddIntervention={handleOpenIntervention}
                          />
                        ))}
                        
                        {topRhks.length === 0 && (
                          <div className="p-20 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-black bg-white/50 text-lg flex items-center space-x-6 shadow-sm">
                            <AlertCircle size={32} className="text-slate-300" />
                            <span>Belum ada Rencana Hasil Kerja Utama. Tambahkan melalui tombol (+) di atas.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-50 flex items-center bg-white p-3.5 rounded-[2rem] shadow-2xl border border-slate-200 space-x-4 animate-in slide-in-from-bottom-12 duration-500">
        <div className="flex items-center bg-slate-50 rounded-[1.25rem] p-2 mr-2">
          <button 
            onClick={() => setIsHandTool(false)}
            className={`p-3.5 rounded-xl transition-all ${!isHandTool ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            title="Kursor Seleksi"
          >
            <MousePointer2 size={22} />
          </button>
          <button 
            onClick={() => setIsHandTool(true)}
            className={`p-3.5 rounded-xl transition-all ${isHandTool ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            title="Genggam (Navigasi)"
          >
            <Hand size={22} />
          </button>
        </div>

        <div className="w-px h-10 bg-slate-100"></div>

        <button onClick={handleZoomOut} className="p-4 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all active:scale-90" title="Zoom Out">
          <ZoomOut size={24} />
        </button>
        <div className="w-20 text-center text-[13px] font-black text-slate-800 tabular-nums bg-slate-50 py-2.5 rounded-xl border border-slate-100 shadow-inner">
          {Math.round(scale * 100)}%
        </div>
        <button onClick={handleZoomIn} className="p-4 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all active:scale-90" title="Zoom In">
          <ZoomIn size={24} />
        </button>
        <div className="w-px h-10 bg-slate-100 mx-2"></div>
        <button onClick={handleResetZoom} className="p-4 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all active:scale-90" title="Pas Tengah">
          <Maximize size={24} />
        </button>
      </div>

      {isModalOpen && selectedEmployee && (
        <RhkInterventionModal 
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} parentRhk={selectedParent} employee={selectedEmployee} initialData={editingRhk} onSave={handleSaveRhk}
        />
      )}

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({isOpen: false, rhk: null})} onConfirm={confirmDeleteRhk} title="Hapus Rencana Kerja?" message="Menghapus RHK ini akan menghapus permanen seluruh intervensi kinerja yang terhubung di bawahnya secara hierarki." itemName={deleteModal.rhk?.title}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 12px; height: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 12px; border: 3px solid #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .custom-scrollbar-mini::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .cursor-grab { cursor: grab; }
        .cursor-grabbing { cursor: grabbing; }
      `}</style>
    </div>
  );
};

export default CascadingMatrix;
