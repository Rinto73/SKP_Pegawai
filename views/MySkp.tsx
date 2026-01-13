
import React from 'react';
import { Employee, RHK, Role } from '../types';
import { FileText, Target, ChevronRight, User, GitBranch, Shield, ShieldAlert } from 'lucide-react';

interface MySkpProps {
  employee: Employee;
  rhks: RHK[];
  employees: Employee[];
}

const MySkp: React.FC<MySkpProps> = ({ employee, rhks, employees }) => {
  const isAdmin = employee.role === Role.ADMIN;
  const myRhks = rhks.filter(r => r.employeeId === employee.id);
  const superior = employees.find(e => e.id === employee.superiorId);

  return (
    <div className="max-w-[1600px] mx-auto px-8 md:px-12 lg:px-16 py-10 md:py-16 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isAdmin ? 'Profil Administrator' : 'SKP & Rencana Kinerja'}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {isAdmin ? 'Informasi akun pengelola sistem e-Kinerja SKP.' : 'Manajemen target dan rencana hasil kerja tahunan Anda.'}
          </p>
        </div>
        <div className={`flex items-center space-x-3 px-6 py-3 rounded-[1.25rem] border shadow-sm ${
          isAdmin ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
        }`}>
          {isAdmin ? <ShieldAlert size={20} /> : <Shield size={20} />}
          <span className="text-[11px] font-black uppercase tracking-[0.1em]">{employee.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm h-fit sticky top-28">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-[2.25rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-8 shadow-inner relative overflow-hidden group">
              <User size={64} className="group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="font-black text-slate-800 leading-tight text-xl">{employee.name}</h3>
            <p className="text-sm text-slate-400 mt-2 font-mono tracking-tighter">{employee.nip}</p>
            <p className={`text-[12px] font-black mt-6 px-6 py-3 rounded-2xl uppercase tracking-tight ${
              isAdmin ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
            }`}>{employee.position}</p>
          </div>

          <div className="mt-12 space-y-8">
            <div className="pt-8 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Pejabat Penilai</p>
              {superior ? (
                <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shrink-0 shadow-sm">
                    <User size={22} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-slate-800 truncate">{superior.name}</p>
                    <p className="text-[10px] text-slate-400 truncate uppercase font-bold mt-1 tracking-tight">{superior.position}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 text-center">
                  <p className="text-xs text-slate-400 italic font-bold">
                    {isAdmin ? 'Root Administrator' : 'Jabatan Puncak Organisasi'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-8 border-t border-slate-50">
              <div className="bg-slate-900 rounded-[1.75rem] p-6 text-white shadow-xl shadow-slate-200">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Tahun Anggaran</p>
                <p className="text-2xl font-black">2024 / 2025</p>
                <div className="mt-4 flex items-center space-x-3 text-[10px] font-black text-slate-400">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span>PERIODE PENYUSUNAN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-10">
          {isAdmin ? (
            <div className="bg-white border border-slate-200 rounded-[3rem] p-20 text-center shadow-sm">
              <div className="bg-emerald-50 w-28 h-28 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-10 shadow-inner">
                <ShieldAlert className="text-emerald-600" size={56} />
              </div>
              <h4 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Privilese Administrator</h4>
              <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed font-medium">
                Sebagai Administrator, fokus utama Anda adalah orkestrasi data organisasi dan validasi kebijakan kinerja global, bukan pengisian RHK operasional individu.
              </p>
              <button className="mt-12 px-10 py-4 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
                Buka Kontrol Panel
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                    <FileText size={24} />
                  </div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">Rencana Hasil Kerja Utama</h3>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[11px] font-black px-5 py-2 rounded-xl uppercase tracking-widest border border-slate-200 shadow-sm">
                  {myRhks.length} RHK TERDATA
                </span>
              </div>

              {myRhks.length === 0 ? (
                <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-32 text-center">
                  <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <FileText className="text-slate-300" size={48} />
                  </div>
                  <p className="text-slate-400 font-black text-xl mb-3">Belum Ada Rencana Kerja</p>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">Silakan koordinasi dengan pimpinan Anda untuk proses intervensi target kinerja organisasi.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {myRhks.map((rhk) => (
                    <div key={rhk.id} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group">
                      <div className="p-10">
                        <div className="flex justify-between items-start mb-10">
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                              <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border ${
                                rhk.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {rhk.status}
                              </span>
                              <span className="text-[10px] font-black uppercase px-4 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                                KATEGORI: {rhk.type}
                              </span>
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{rhk.title}</h4>
                            <p className="text-base text-slate-500 italic font-medium leading-relaxed max-w-3xl">{rhk.description}</p>
                          </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Indikator Kinerja Individu (IKI)</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {rhk.indicators.map((ind) => (
                              <div key={ind.id} className="bg-slate-50/50 p-6 rounded-[1.75rem] border border-slate-100 flex items-start space-x-5 hover:bg-blue-50/30 transition-colors">
                                <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 shrink-0 border border-slate-50">
                                  <Target size={24} />
                                </div>
                                <div className="space-y-4">
                                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{ind.text}</p>
                                  <div className="flex items-center space-x-8">
                                    <div>
                                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Target Capaian</p>
                                      <p className="text-sm font-black text-blue-600">{ind.target}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Aspek Penilaian</p>
                                      <p className="text-sm font-black text-slate-600">{ind.perspective}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {rhk.parentRhkId && (
                        <div className="bg-slate-900 px-10 py-5 flex items-center space-x-4">
                          <GitBranch size={20} className="text-blue-400" />
                          <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest">
                            Terhubung ke RHK Pimpinan: <span className="text-white ml-2">{rhks.find(r => r.id === rhk.parentRhkId)?.title || 'Intervensi Langsung'}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySkp;
