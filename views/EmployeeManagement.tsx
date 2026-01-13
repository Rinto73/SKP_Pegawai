
import React, { useState, useRef } from 'react';
import { Employee, Role } from '../types';
import { Plus, Search, Edit2, Trash2, UserPlus, Shield, User, Users, Upload, Download, FileText, X, CheckCircle, FileSpreadsheet } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    nip: '',
    name: '',
    position: '',
    role: Role.PELAKSANA,
    gender: 'L',
    superiorId: '',
  });

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nip.includes(searchTerm)
  );

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({ nip: '', name: '', position: '', role: Role.PELAKSANA, gender: 'L', superiorId: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({ ...emp });
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

  const downloadTemplate = () => {
    const data = [
      ["NIP", "Nama", "Jabatan", "Role", "Gender (L/P)", "ID Atasan (Opsional)"],
      ["199001012015011001", "Budi Sudarsono", "Analis Kebijakan", "PELAKSANA", "L", ""],
      ["198502022010022002", "Siti Aminah", "Kepala Bagian", "KABAG", "P", ""]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_pegawai.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedEmployees: Employee[] = jsonData.map((row: any, index: number) => {
          const findVal = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => 
              keys.some(key => k.toLowerCase().includes(key.toLowerCase()))
            );
            return foundKey ? row[foundKey] : '';
          };

          const nip = findVal(['nip', 'id', 'nomor']).toString();
          const name = findVal(['nama', 'name', 'pegawai']);
          const position = findVal(['jabatan', 'position', 'tugas']);
          const roleStr = findVal(['role', 'level', 'pangkat']).toString().toUpperCase();
          const genderRaw = findVal(['gender', 'jk', 'kelamin']).toString().toUpperCase();
          const superiorId = findVal(['atasan', 'superior', 'parent']);

          let role = Role.PELAKSANA;
          if (roleStr.includes('SEKDA')) role = Role.SEKDA;
          else if (roleStr.includes('ASISTEN')) role = Role.ASISTEN;
          else if (roleStr.includes('KABAG')) role = Role.KABAG;
          else if (roleStr.includes('KASUBAG')) role = Role.KASUBAG;

          const gender = genderRaw.startsWith('P') ? 'P' : 'L';

          return {
            id: `imp-${Date.now()}-${index}`,
            nip: nip || `NIP-${Date.now()}-${index}`,
            name: name || 'Tanpa Nama',
            position: position || 'Tanpa Jabatan',
            role: role,
            gender: gender,
            superiorId: superiorId ? superiorId.toString() : undefined,
          };
        });

        setImportPreview(parsedEmployees);
      } catch (error) {
        console.error("Error parsing Excel:", error);
        alert("Gagal membaca file.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmImport = () => {
    onBulkAdd(importPreview);
    setIsImportModalOpen(false);
    setImportPreview([]);
  };

  const getRoleBadge = (role: Role) => {
    switch(role) {
      case Role.SEKDA: return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight">Sekda</span>;
      case Role.ASISTEN: return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight">Asisten</span>;
      case Role.KABAG: return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight">Kabag</span>;
      case Role.KASUBAG: return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight">Kasubag</span>;
      default: return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight">Pelaksana</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pegawai</h1>
          <p className="text-slate-500 text-sm">Gunakan NIP untuk melakukan login ke dalam sistem.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95">
            <FileSpreadsheet size={18} className="text-emerald-600" />
            <span>Import Excel</span>
          </button>
          <button onClick={handleOpenAdd} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
            <UserPlus size={18} />
            <span>Tambah Pegawai</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, jabatan, atau NIP..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold text-[11px] uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Data Pegawai</th>
                <th className="px-6 py-4">NIP</th>
                <th className="px-6 py-4">Jabatan & Role</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{emp.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{emp.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{emp.nip}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs text-slate-600 font-medium">{emp.position}</p>
                      {getRoleBadge(emp.role)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(emp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(emp)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">{editingEmp ? 'Edit Data Pegawai' : 'Registrasi Pegawai Baru'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">NIP</label>
                    <input required placeholder="Nomor Induk Pegawai" className="w-full border border-slate-200 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                      value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Jenis Kelamin</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, gender: 'L'})}
                        className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${formData.gender === 'L' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >Laki-laki</button>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, gender: 'P'})}
                        className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${formData.gender === 'P' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >Perempuan</button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Nama Lengkap</label>
                  <input required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black font-bold"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Jabatan Eksisting</label>
                  <input required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                    value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Role SKP</label>
                    <select className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                      value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})}>
                      {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block tracking-wider">Atasan Langsung</label>
                    <select className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
                      value={formData.superiorId} onChange={e => setFormData({...formData, superiorId: e.target.value})}>
                      <option value="">Tidak ada</option>
                      {employees.filter(e => e.id !== editingEmp?.id).map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-bold text-slate-500 uppercase tracking-widest">Batal</button>
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 uppercase tracking-widest text-xs">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Import Data Excel</h3>
                <p className="text-xs text-slate-500">Pastikan file memiliki kolom NIP untuk login.</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {!importPreview.length ? (
                <div className="space-y-4">
                  <div 
                    className={`border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-blue-400 transition-colors cursor-pointer group ${isProcessing ? 'opacity-50 cursor-wait' : ''}`} 
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
                    <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="text-emerald-600" size={32} />
                    </div>
                    <p className="text-slate-800 font-bold">{isProcessing ? 'Memproses...' : 'Klik untuk Pilih File Excel'}</p>
                    <p className="text-slate-400 text-xs mt-1 text-center">Contoh Format Excel:<br/>NIP, Nama, Jabatan, Role, Gender (L/P)</p>
                  </div>
                  <button onClick={downloadTemplate} className="w-full border border-blue-200 text-blue-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors">Download Template Excel</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-slate-700">Preview ({importPreview.length} Pegawai)</p>
                    <button onClick={() => setImportPreview([])} className="text-xs font-bold text-red-500">Batal</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-500">NIP</th>
                          <th className="px-4 py-3 font-bold text-slate-500">Nama</th>
                          <th className="px-4 py-3 font-bold text-slate-500">Gender</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {importPreview.map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono text-slate-400">{p.nip}</td>
                            <td className="px-4 py-3 font-bold text-slate-700">{p.name}</td>
                            <td className="px-4 py-3 text-slate-500">{p.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 flex justify-end space-x-3">
              <button onClick={() => setIsImportModalOpen(false)} className="px-5 py-2 text-sm font-bold text-slate-500">Batal</button>
              <button 
                disabled={!importPreview.length}
                onClick={confirmImport}
                className="px-8 py-2 bg-blue-600 disabled:bg-slate-300 text-white rounded-xl font-black shadow-lg uppercase tracking-widest text-xs"
              >
                Konfirmasi Import
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, emp: null })}
        onConfirm={confirmDelete}
        title="Hapus Data Pegawai?"
        message="Menghapus pegawai akan menghapus SELURUH data RHK dan histori kinerja yang terkait dengan pegawai ini. Tindakan ini tidak dapat dibatalkan."
        itemName={`${deleteModal.emp?.name} (${deleteModal.emp?.nip})`}
      />
    </div>
  );
};

export default EmployeeManagement;
