
import React, { useState, useRef, useEffect } from 'react';
import { Employee, Role } from '../types';
import { Plus, Search, Edit2, Trash2, UserPlus, Shield, User, Users, Upload, Download, FileText, X, CheckCircle, FileSpreadsheet, ChevronDown, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface EmployeeManagementProps {
  employees: Employee[];
  onAdd: (emp: Employee) => void;
  onBulkAdd: (emps: Employee[]) => void;
  onUpdate: (emp: Employee) => void;
  onDelete: (id: string) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, onAdd, onBulkAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, emp: Employee | null}>({isOpen: false, emp: null});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [importPreview, setImportPreview] = useState<Employee[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [superiorSearch, setSuperiorSearch] = useState('');
  const [isSuperiorDropdownOpen, setIsSuperiorDropdownOpen] = useState(false);
  const superiorDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<Employee>>({
    nip: '',
    name: '',
    position: '',
    role: Role.PELAKSANA,
    gender: 'L',
    superiorId: '',
    isPartTime: false,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (superiorDropdownRef.current && !superiorDropdownRef.current.contains(event.target as Node)) {
        setIsSuperiorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.superiorId) {
      const superior = employees.find(e => e.id === formData.superiorId);
      if (superior) setSuperiorSearch(superior.name);
      else setSuperiorSearch('');
    } else {
      setSuperiorSearch('');
    }
  }, [formData.superiorId, employees]);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nip.includes(searchTerm)
  );

  const filteredSuperiors = employees.filter(emp => {
    if (editingEmp && emp.id === editingEmp.id) return false;
    const search = superiorSearch.toLowerCase();
    return emp.name.toLowerCase().includes(search) || emp.nip.includes(search);
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({ nip: '', name: '', position: '', role: Role.PELAKSANA, gender: 'L', superiorId: '', isPartTime: false });
    setSuperiorSearch('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({ ...emp });
    const superior = employees.find(e => e.id === emp.superiorId);
    setSuperiorSearch(superior ? superior.name : '');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (emp: Employee) => {
    setDeleteModal({ isOpen: true, emp });
  };

  const confirmDelete = () => {
    if (deleteModal.emp) {
      onDelete(deleteModal.emp.id);
      setDeleteModal({ isOpen: false, emp: null });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      id: editingEmp ? editingEmp.id : `emp-${Date.now()}`,
    } as Employee;

    if (editingEmp) onUpdate(payload);
    else onAdd(payload);

    setIsModalOpen(false);
  };

  const getRoleBadge = (emp: Employee) => {
    const role = emp.role;
    let badge = null;
    switch(role) {
      case Role.SEKDA: badge = <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">Sekda</span>; break;
      case Role.ASISTEN: badge = <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">Asisten</span>; break;
      case Role.KABAG: badge = <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">Kabag</span>; break;
      case Role.KASUBAG: badge = <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">Kasubag</span>; break;
      default: badge = <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">Pelaksana</span>; break;
    }

    return (
      <div className="flex items-center gap-2">
        {badge}
        {emp.isPartTime && (
          <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight flex items-center gap-1 shadow-sm">
            <Clock size={10} />
            Paruh Waktu
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-8 md:px-12 lg:px-16 py-10 md:py-16 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Pegawai</h1>
          <p className="text-slate-500 text-sm font-medium">Kelola data NIP, jabatan, dan struktur hierarki organisasi.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button onClick={handleOpenAdd} className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95">
            <UserPlus size={20} />
            <span>Tambah Pegawai</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama, jabatan, atau NIP..." 
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-5">Profil Pegawai</th>
                <th className="px-10 py-5">NIP / Identitas</th>
                <th className="px-10 py-5">Jabatan & Peran</th>
                <th className="px-10 py-5 text-right">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <User size={28} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{emp.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{emp.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-mono text-xs text-slate-500 tracking-tighter">{emp.nip}</td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-slate-700 font-bold">{emp.position}</p>
                      <div className="flex">{getRoleBadge(emp)}</div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleOpenEdit(emp)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-100/50 rounded-xl transition-all" title="Edit Data">
                        <Edit2 size={20} />
                      </button>
                      <button onClick={() => handleDeleteClick(emp)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-100/50 rounded-xl transition-all" title="Hapus Pegawai">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEmployees.length === 0 && (
            <div className="p-32 text-center">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                <Users className="text-slate-300" size={40} />
              </div>
              <p className="text-slate-400 font-bold text-lg">Data pegawai tidak ditemukan</p>
              <p className="text-slate-400 text-sm mt-1">Coba gunakan kata kunci pencarian yang berbeda.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit}>
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingEmp ? 'Edit Data Pegawai' : 'Registrasi Pegawai'}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Lengkapi rincian identitas dan struktur organisasi.</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24} /></button>
              </div>
              
              <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2.5 block tracking-widest">Nomor Induk Pegawai (NIP)</label>
                    <input required placeholder="Contoh: 1990..." className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-black shadow-inner"
                      value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2.5 block tracking-widest">Jenis Kelamin</label>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, gender: 'L'})}
                        className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${formData.gender === 'L' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >Laki-laki</button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, gender: 'P'})}
                        className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${formData.gender === 'P' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >Perempuan</button>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-600 text-white p-2 rounded-xl">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-indigo-900 uppercase">Status PPPK Paruh Waktu</p>
                      <p className="text-[10px] text-indigo-600 font-medium">Aktifkan jika pegawai ini adalah tenaga paruh waktu.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, isPartTime: !formData.isPartTime})}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.isPartTime ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.isPartTime ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2.5 block tracking-widest">Nama Lengkap & Gelar</label>
                  <input required placeholder="Contoh: Drs. Budi Santoso, M.Si" className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-black font-bold shadow-inner"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2.5 block tracking-widest">Jabatan Definitif</label>
                  <input required placeholder="Contoh: Analis SDM Aparatur Ahli Muda" className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-black font-medium shadow-inner"
                    value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2.5 block tracking-widest">Level Hierarki SKP</label>
                    <select className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-black font-bold appearance-none cursor-pointer shadow-inner"
                      value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})}>
                      {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  
                  <div className="relative" ref={superiorDropdownRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2.5 block tracking-widest">Atasan Langsung</label>
                    <div className="relative cursor-text" onClick={() => setIsSuperiorDropdownOpen(true)}>
                      <input 
                        type="text"
                        placeholder="Cari & Pilih Atasan..."
                        className="w-full border border-slate-200 rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-black font-medium shadow-inner"
                        value={superiorSearch}
                        onChange={(e) => {
                          setSuperiorSearch(e.target.value);
                          setIsSuperiorDropdownOpen(true);
                          if (!e.target.value) setFormData({...formData, superiorId: ''});
                        }}
                        onFocus={() => setIsSuperiorDropdownOpen(true)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={18} />
                      </div>
                    </div>

                    {isSuperiorDropdownOpen && (
                      <div className="absolute z-[110] w-full mt-3 bg-white border border-slate-200 rounded-[2rem] shadow-2xl max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200">
                        <div 
                          className="px-6 py-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                          onClick={() => {
                            setFormData({...formData, superiorId: ''});
                            setSuperiorSearch('');
                            setIsSuperiorDropdownOpen(false);
                          }}
                        >
                          --- Tanpa Atasan (Top Level) ---
                        </div>
                        {filteredSuperiors.map(sub => (
                          <div 
                            key={sub.id}
                            onClick={() => {
                              setFormData({...formData, superiorId: sub.id});
                              setSuperiorSearch(sub.name);
                              setIsSuperiorDropdownOpen(false);
                            }}
                            className={`px-6 py-4 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center space-x-4 transition-colors ${formData.superiorId === sub.id ? 'bg-blue-50' : ''}`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shrink-0">
                              <User size={18} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-black text-slate-800 truncate">{sub.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-tight">{sub.position}</p>
                            </div>
                            {formData.superiorId === sub.id && (
                              <div className="ml-auto text-blue-600">
                                <CheckCircle size={20} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-50/80 flex justify-end space-x-5 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors">Batal</button>
                <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-[1.25rem] font-black shadow-xl shadow-blue-200 uppercase tracking-widest text-[11px] hover:bg-blue-700 transition-all active:scale-95">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, emp: null })}
        onConfirm={confirmDelete}
        title="Hapus Pegawai?"
        message="Menghapus pegawai ini akan menghilangkan seluruh histori kinerja yang terkait dengannya."
        itemName={deleteModal.emp?.name}
      />
    </div>
  );
};

export default EmployeeManagement;
