
import React from 'react';
import { TrendingUp, AlertCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import { Employee, RHK } from '../types';

interface DashboardProps {
  employees: Employee[];
  rhks: RHK[];
}

const Dashboard: React.FC<DashboardProps> = ({ employees, rhks }) => {
  const stats = [
    { label: 'Total Pegawai', value: employees.length, icon: ShieldCheck, iconColor: "text-blue-600", color: 'bg-blue-50' },
    { label: 'RHK Terisi', value: rhks.length, icon: TrendingUp, iconColor: "text-emerald-600", color: 'bg-emerald-50' },
    { label: 'RHK Draft', value: rhks.filter(r => r.status === 'Draft').length, icon: Clock, iconColor: "text-amber-600", color: 'bg-amber-50' },
    { label: 'Bawahan Belum Isi', value: employees.filter(e => e.superiorId && !rhks.some(r => r.employeeId === e.id)).length, icon: AlertCircle, iconColor: "text-rose-600", color: 'bg-rose-50' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-8 md:px-12 lg:px-16 py-10 md:py-16 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ringkasan Kinerja Organisasi</h1>
        <p className="text-slate-500 text-sm font-medium">Pantau progres penyusunan SKP dan cascading di seluruh unit kerja Pemerintah Daerah.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex items-center space-x-6 hover:shadow-md transition-shadow">
            <div className={`p-5 rounded-2xl ${stat.color}`}>
              <stat.icon size={28} className={stat.iconColor} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <p className="text-4xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/30">
          <h3 className="font-black text-slate-800 text-lg">Unit Kerja & Progres Pegawai</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama pegawai..." 
              className="w-full sm:w-72 pl-12 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Nama Pegawai</th>
                <th className="px-8 py-5">Jabatan</th>
                <th className="px-8 py-5 text-center">Status RHK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.slice(0, 10).map((emp, idx) => {
                const hasRhk = rhks.some(r => r.employeeId === emp.id);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-base">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{emp.nip}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-medium">{emp.position}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${
                        hasRhk ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
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
    </div>
  );
};

export default Dashboard;
