
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {isAdmin ? 'Profil Administrator' : 'SKP Saya'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdmin ? 'Informasi akun pengelola sistem e-Kinerja.' : 'Lihat dan kelola rencana hasil kerja pribadi Anda tahun ini.'}
          </p>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${
          isAdmin ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
        }`}>
          {isAdmin ? <ShieldAlert size={16} /> : <Shield size={16} />}
          <span className="text-xs font-bold uppercase">{employee.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-inner">
              <User size={48} />
            </div>
            <h3 className="font-black text-slate-800 leading-tight">{employee.name}</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-tight">{employee.nip}</p>
            <p className={`text-[11px] font-black mt-2 px-3 py-1 rounded-full uppercase ${
              isAdmin ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
            }`}>{employee.position}</p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="pt-4 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Atasan Langsung</p>
              {superior ? (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                    <User size={14} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-700 truncate">{superior.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{superior.position}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  {isAdmin ? 'System Root Account' : 'Pejabat Tertinggi'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {isAdmin ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="text-emerald-600" size={40} />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-2">Akun Administrator Sistem</h4>
              <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                Sebagai Administrator, Anda tidak memiliki target Rencana Hasil Kerja (RHK) operasional dalam sistem ini. 
                Tugas Anda adalah memantau dan mengelola struktur organisasi serta cascading kinerja pegawai lain.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center space-x-2">
                  <FileText size={20} className="text-blue-600" />
                  <span>Daftar RHK Utama</span>
                </h3>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                  {myRhks.length} RHK
                </span>
              </div>

              {myRhks.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-400 font-medium">Anda belum memiliki RHK. Tunggu intervensi dari pimpinan atau buat RHK baru.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRhks.map((rhk) => (
                    <div key={rhk.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-blue-300 transition-colors">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                rhk.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {rhk.status}
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                                RHK {rhk.type}
                              </span>
                            </div>
                            <h4 className="text-lg font-black text-slate-800 leading-tight">{rhk.title}</h4>
                            <p className="text-sm text-slate-500 italic">{rhk.description}</p>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Indikator Kinerja Individu (IKI)</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rhk.indicators.map((ind) => (
                              <div key={ind.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600 shrink-0">
                                  <Target size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-700 leading-snug">{ind.text}</p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <div>
                                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">Target</p>
                                      <p className="text-[11px] font-black text-blue-600">{ind.target}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">Perspektif</p>
                                      <p className="text-[11px] font-black text-slate-600">{ind.perspective}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {rhk.parentRhkId && (
                        <div className="bg-blue-600/5 px-6 py-3 border-t border-blue-100 flex items-center space-x-3">
                          <GitBranch size={14} className="text-blue-500" />
                          <p className="text-[10px] text-blue-700 font-bold uppercase tracking-tight">
                            Mengintervensi RHK Pimpinan: {rhks.find(r => r.id === rhk.parentRhkId)?.title || 'RHK Atasan'}
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
