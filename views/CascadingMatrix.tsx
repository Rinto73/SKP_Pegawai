
import React, { useState } from 'react';
import { RHK, Employee, Role } from '../types';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, User, Target, Share2, MoreHorizontal, Shield } from 'lucide-react';
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

  const getRoleLabel = (role: Role) => {
    switch(role) {
      case Role.SEKDA: return 'Sekretaris Daerah';
      case Role.ASISTEN: return 'Asisten';
      case Role.KABAG: return 'Kepala Bagian';
      case Role.KASUBAG: return 'Kepala Sub Bagian';
      default: return 'Pelaksana';
    }
  };

  const getCardBorder = (role: Role) => {
    switch(role) {
      case Role.SEKDA: return 'border-purple-500 ring-4 ring-purple-50';
      case Role.ASISTEN: return 'border-blue-500 ring-4 ring-blue-50';
      case Role.KABAG: return 'border-emerald-500';
      case Role.KASUBAG: return 'border-amber-500';
      default: return 'border-slate-200';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {level > 0 && <div className="w-0.5 h-8 bg-slate-300"></div>}

      <div className={`relative w-[340px] md:w-[420px] bg-white border-2 rounded-2xl shadow-lg transition-all z-10 ${getCardBorder(owner.role)}`}>
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50 rounded-t-2xl">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
            <User size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
              {getRoleLabel(owner.role)}
            </p>
            <p className="text-xs font-bold text-slate-800 truncate">{owner.name}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase font-medium">{owner.position}</p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <h4 className="text-sm font-black text-slate-800 leading-tight line-clamp-2">{rhk.title}</h4>
          <p className="text-[11px] text-slate-500 italic line-clamp-2">{rhk.description}</p>
          
          {rhk.indicators.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {rhk.indicators.slice(0, 2).map(ind => (
                <div key={ind.id} className="bg-blue-50 text-[9px] font-bold text-blue-700 px-2 py-1 rounded-md border border-blue-100 flex items-center space-x-1">
                  <Target size={10} />
                  <span>{ind.target}</span>
                </div>
              ))}
              {rhk.indicators.length > 2 && <span className="text-[9px] text-slate-400 font-bold">+{rhk.indicators.length - 2} lagi</span>}
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex items-center justify-between relative">
          <div className="flex space-x-1">
            <button onClick={() => onEdit(rhk, owner)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(rhk)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {subordinates.length > 0 && (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActiveMenu(isMenuOpen ? null : rhk.id);
                  }}
                  className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span className="text-[10px] font-bold">Intervensi</span>
                </button>
                
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => onSetActiveMenu(null)}></div>
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="p-3 bg-slate-900 text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center justify-between">
                        <span>Pilih Bawahan Pelaksana</span>
                        <MoreHorizontal size={14} />
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {subordinates.map(sub => (
                          <button 
                            key={sub.id}
                            onClick={() => {
                              onAddIntervention(rhk, sub);
                              onSetActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 text-[11px] font-bold text-slate-700 border-b border-slate-50 last:border-0 flex items-center space-x-3 transition-colors"
                          >
                            <div className="bg-slate-100 p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600">
                              <User size={14} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate">{sub.name}</p>
                              <p className="text-[9px] text-slate-400 font-medium truncate uppercase">{sub.position}</p>
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
                onClick={() => onToggleRhk(rhk.id)}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  isExpanded ? 'bg-slate-200 text-slate-700' : 'bg-emerald-600 text-white shadow-md'
                }`}
              >
                <span>{isExpanded ? 'Tutup' : `Buka (${childRhks.length})`}</span>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && childRhks.length > 0 && (
        <div className="relative pt-8 flex flex-col items-center">
          <div className="absolute top-0 w-0.5 h-8 bg-slate-300"></div>
          {childRhks.length > 1 && (
            <div className="absolute top-8 h-0.5 bg-slate-300" 
                 style={{ width: `calc(100% - ${420 / childRhks.length}px)` }}></div>
          )}
          <div className="flex gap-12">
            {childRhks.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                 {childRhks.length > 1 && <div className="w-0.5 h-8 bg-slate-300 -mt-8"></div>}
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
    
    // Kirim ke database melalui App.tsx
    await onSaveRhkRemote(
      { ...formData, id: editingRhk?.id },
      selectedEmployee.id,
      selectedParent?.id
    );

    setIsModalOpen(false);
  };

  const topLeaders = employees.filter(e => !e.superiorId && e.role !== Role.ADMIN);

  return (
    <div className="min-h-screen bg-slate-50/50 -m-8 p-8 overflow-auto">
      <div className="mb-12">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Diagram Cascading SKP</h1>
        <p className="text-slate-500 text-sm">Klik tombol <b>"Intervensi"</b> pada pimpinan untuk membagikan tugas ke bawahan.</p>
      </div>

      <div className="inline-block min-w-full pb-32">
        <div className="flex flex-col items-center space-y-20">
          {topLeaders.map(topLeader => {
            const topRhks = rhks.filter(r => r.employeeId === topLeader.id && !r.parentRhkId);
            return (
              <div key={topLeader.id} className="flex flex-col items-center space-y-12 w-full">
                <div className="bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4 border-4 border-white">
                  <Share2 className="text-blue-400" size={20} />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Jabatan Puncak Unit Kerja</span>
                    <span className="text-sm font-bold">{topLeader.name} ({topLeader.position})</span>
                  </div>
                  <button 
                    onClick={() => handleOpenAddTopRhk(topLeader)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-transform active:scale-90"
                    title="Tambah RHK Pimpinan"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-16 w-full">
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
                    <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium bg-white">
                      Belum ada RHK Utama pimpinan. Klik (+) di atas untuk menambahkan.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && selectedEmployee && (
        <RhkInterventionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          parentRhk={selectedParent}
          employee={selectedEmployee}
          initialData={editingRhk}
          onSave={handleSaveRhk}
        />
      )}

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({isOpen: false, rhk: null})}
        onConfirm={confirmDeleteRhk}
        title="Hapus Rencana Kerja?"
        message="Tindakan ini akan menghapus RHK ini secara permanen beserta SELURUH intervensi di bawahnya (cascading)."
        itemName={deleteModal.rhk?.title}
      />
    </div>
  );
};

export default CascadingMatrix;
