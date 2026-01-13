
import React from 'react';
import { TrendingUp, CheckCircle2, AlertCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import { Employee, RHK } from '../types';

interface DashboardProps {
  employees: Employee[];
  rhks: RHK[];
}

const Dashboard: React.FC<DashboardProps> = ({ employees, rhks }) => {
  const stats = [
    { label: 'Total Pegawai', value: employees.length, icon: <ShieldCheck className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'RHK Terisi', value: rhks.length, icon: <TrendingUp className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'RHK Draft', value: rhks.filter(r => r.status === 'Draft').length, icon: <Clock className="text-amber-600" />, color: 'bg-amber-50' },
    { label: 'Bawahan Belum Isi', value: employees.filter(e => e.superiorId && !rhks.some(r => r.employeeId === e.id)).length, icon: <AlertCircle className="text-rose-600" />, color: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Ringkasan Kinerja Organisasi</h1>
        <p className="text-slate-500 text-sm">Pantau progres penyusunan SKP dan cascading di seluruh unit kerja.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Unit Kerja & Progres</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari..." 
                className="pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
              />
            </div>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Nama Pegawai</th>
                  <th className="px-6 py-4">Jabatan</th>
                  <th className="px-6 py-4">Status RHK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.slice(0, 5).map((emp, idx) => {
                  const hasRhk = rhks.some(r => r.employeeId === emp.id);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{emp.name}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{emp.position}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          hasRhk ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {hasRhk ? 'Terisi' : 'Belum Ada'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white space-y-6 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <h3 className="font-black text-xl mb-2">Penyusunan Cerdas</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sistem kami menggunakan Gemini AI untuk memastikan cascading kinerja selaras antara pimpinan dan staf.
            </p>
          </div>
          <div className="space-y-4 relative z-10">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status Sistem</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-slate-300">Semua Fungsi Siap Digunakan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
