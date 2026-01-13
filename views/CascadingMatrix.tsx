
import React, { useState, useRef } from 'react';
import { RHK, Employee, Role } from '../types';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, User, Target, Share2, MoreHorizontal, Shield, AlertCircle, ZoomIn, ZoomOut, Maximize, Hand, MousePointer2 } from 'lucide-react';
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
      case Role.SEKDA: return 'border-purple-500 ring-2 ring-purple-50';
      case Role.ASISTEN: return 'border-blue-500 ring-2 ring-blue-50';
      case Role.KABAG: return 'border-emerald-500';
      case Role.KASUBAG: return 'border-amber-500';
      default: return 'border-slate-200';
    }
  };

  const cardWidth = 300; 

  return (
    <div className="flex flex-col items-center shrink-0">
      {/* Container untuk garis hierarki yang lebih rapi */}
      <div className={`relative bg-white border-2 rounded-xl shadow-md transition-all z-10 ${getCardBorder(owner.role)}`} style={{ width: `${cardWidth}px` }}>
        {/* Header - Kompak p-2 */}
        <div className="p-2 border-b border-slate-100 flex items-center space-x-2 bg-slate-50/50 rounded-t-xl">
          <div className="w-7 h-7 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
            <User size={12} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">{owner.name}</p>
            <p className="text-[8px] text-slate-500 truncate uppercase font-medium leading-tight">{owner.position}</p>
          </div>
        </div>

        {/* Content - Kompak p-2.5 & Judul Full Scroll */}
        <div className="p-2.5 space-y-2">
          <div className="max-h-32 overflow-y-auto custom-scrollbar-mini pr-1">
            <h4 className="text-[11px] font-black text-slate-800 leading-tight">
              {rhk.title}
            </h4>
          </div>
          
          {rhk.indicators.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1">
              {rhk.indicators.slice(0, 1).map(ind => (
                <div key={ind.id} className="bg-blue-50 text-[8px] font-bold text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 flex items-center space-x-1">
                  <Target size={8} />
                  <span>{ind.target}</span>
                </div>
              ))}
              {rhk.indicators.length > 1 && <span className="text-[8px] text-slate-400 font-bold">+{rhk.indicators.length - 1} lagi</span>}
            </div>
          )}
        </div>

        {/* Footer - Kompak py-1.5 */}
        <div className="px-3 py-1.5 bg-slate-50 rounded-b-xl border-t border-slate-100 flex items-center justify-between relative">
          <div className="flex space-x-1">
            <button onClick={(e) => { e.stopPropagation(); onEdit(rhk, owner); }} className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors pointer-events-auto">
              <Edit2 size={11} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(rhk); }} className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors pointer-events-auto">
              <Trash2 size={11} />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 pointer-events-auto">
            {subordinates.length > 0 && (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActiveMenu(isMenuOpen ? null : rhk.id);
                  }}
                  className="p-1 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 transition-colors flex items-center space-x-1"
                >
                  <Plus size={11} />
                  <span className="text-[8px] font-bold">Intervensi</span>
                </button>
                
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => onSetActiveMenu(null)}></div>
                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="p-2 bg-slate-900 text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center justify-between">
                        <span>Pilih Bawahan</span>
                        <MoreHorizontal size={10} />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {subordinates.map(sub => (
                          <button 
                            key={sub.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddIntervention(rhk, sub);
                              onSetActiveMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 text-[10px] font-bold text-slate-700 border-b border-slate-50 last:border-0 flex items-center space-x-2 transition-colors"
                          >
                            <div className="bg-slate-100 p-1 rounded text-slate-400 shrink-0">
                              <User size={10} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate">{sub.name}</p>
                              <p className="text-[8px] text-slate-400 font-medium truncate uppercase">{sub.position}</p>
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
                className={`flex items-center space-x-1 px-1.5 py-1 rounded text-[8px] font-black uppercase transition-all ${
                  isExpanded ? 'bg-slate-200 text-slate-700' : 'bg-emerald-600 text-white shadow-sm'
                }`}
              >
                <span>{isExpanded ? 'Tutup' : `Buka (${childRhks.length})`}</span>
                {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logic Garis Hierarki Baru yang Presisi */}
      {isExpanded && childRhks.length > 0 && (
        <div className="relative pt-8 flex flex-col items-center">
          {/* Garis batang utama dari parent ke cabang */}
          <div className="absolute top-0 w-0.5 h-8 bg-slate-300"></div>
          
          <div className="flex flex-nowrap gap-12 items-start relative">
            {childRhks.map((child, idx) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Garis horizontal penghubung antar cabang yang "pas" */}
                {childRhks.length > 1 && (
                  <div className={`absolute top-0 h-0.5 bg-slate-300 transition-all ${
                    idx === 0 ? 'left-1/2 right-0' : 
                    idx === childRhks.length - 1 ? 'left-0 right-1/2' : 
                    'left-0 right-0'
                  }`} />
                )}
                
                {/* Garis vertikal ke node anak */}
                <div className="w-0.5 h-8 bg-slate-300"></div>
                
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
  
  const [scale, setScale] = useState(1.0);
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

  const topLeaders = employees.filter(e => e.role === Role.SEKDA);

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col overflow-hidden">
      <div className="px-8 md:px-12 lg:px-16 py-10 md:py-12 shrink-0 bg-white/80 backdrop-blur-md z-20 border-b border-slate-100">
        <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Diagram Cascading SKP</h1>
            <p className="text-slate-500 text-sm font-medium">Visualisasi hirarki kinerja pimpinan ke seluruh struktur organisasi daerah.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl border border-blue-100 text-[11px] font-black uppercase tracking-[0.1em]">
              <Shield size={16} />
              <span>SUPER ADMIN ACCESS</span>
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
          <div className="pb-80 pr-80 pl-20 pt-12">
            <div className="flex flex-col items-start space-y-20">
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
                    <div key={topLeader.id} className="flex flex-col items-start space-y-16 pl-10">
                      <div className="bg-slate-900 text-white px-10 py-5 rounded-[2.25rem] shadow-2xl flex items-center space-x-6 border-4 border-white shrink-0 self-start hover:scale-105 transition-transform duration-300">
                        <div className="bg-blue-600/20 p-3 rounded-2xl border border-white/10 shadow-inner">
                          <Share2 size={22} className="text-blue-400" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Puncak Hierarki (SEKDA)</span>
                          <span className="text-lg font-black">{topLeader.name}</span>
                          <span className="text-[11px] text-slate-400 font-bold mt-1 uppercase">Sekretaris Daerah Kab/Kota</span>
                        </div>
                        <button 
                          onClick={() => handleOpenAddTopRhk(topLeader)}
                          className="ml-8 bg-blue-600 hover:bg-blue-700 p-2.5 rounded-2xl transition-all active:scale-90 shadow-xl shadow-blue-500/30"
                          title="Tambah RHK Pimpinan"
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      <div className="flex flex-nowrap justify-start gap-16 items-start pl-8">
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
                          <div className="p-16 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black bg-white/50 text-base flex items-center space-x-5 shadow-sm">
                            <AlertCircle size={28} className="text-slate-300" />
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

      {/* Navigation Tools */}
      <div className="fixed bottom-12 right-12 z-50 flex items-center bg-white p-3 rounded-[1.75rem] shadow-2xl border border-slate-200 space-x-3 animate-in slide-in-from-bottom-12 duration-500">
        <div className="flex items-center bg-slate-50 rounded-2xl p-2 mr-2">
          <button 
            onClick={() => setIsHandTool(false)}
            className={`p-3 rounded-xl transition-all ${!isHandTool ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            title="Kursor Seleksi"
          >
            <MousePointer2 size={20} />
          </button>
          <button 
            onClick={() => setIsHandTool(true)}
            className={`p-3 rounded-xl transition-all ${isHandTool ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            title="Genggam (Navigasi)"
          >
            <Hand size={20} />
          </button>
        </div>

        <div className="w-px h-8 bg-slate-100"></div>

        <button onClick={handleZoomOut} className="p-3.5 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all active:scale-90" title="Zoom Out">
          <ZoomOut size={22} />
        </button>
        <div className="w-16 text-center text-[12px] font-black text-slate-800 tabular-nums bg-slate-50 py-2 rounded-xl border border-slate-100 shadow-inner">
          {Math.round(scale * 100)}%
        </div>
        <button onClick={handleZoomIn} className="p-3.5 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all active:scale-90" title="Zoom In">
          <ZoomIn size={22} />
        </button>
        <div className="w-px h-8 bg-slate-100 mx-2"></div>
        <button onClick={handleResetZoom} className="p-3.5 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all active:scale-90" title="Pas Tengah">
          <Maximize size={22} />
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
