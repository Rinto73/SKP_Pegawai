
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import CascadingMatrix from './views/CascadingMatrix';
import EmployeeManagement from './views/EmployeeManagement';
import MySkp from './views/MySkp';
import Settings from './views/Settings';
import Login from './views/Login';
import { Employee, RHK, Role } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { MOCK_EMPLOYEES, MOCK_RHKS } from './constants';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rhks, setRhks] = useState<RHK[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const mapEmployee = (item: any): Employee => ({
    id: item.id,
    nip: item.nip,
    name: item.name,
    position: item.position,
    role: item.role as Role,
    gender: item.gender as 'L' | 'P',
    superiorId: item.superior_id
  });

  const mapRHK = (item: any): RHK => ({
    id: item.id,
    employeeId: item.employee_id,
    parentRhkId: item.parent_rhk_id,
    title: item.title,
    description: item.description,
    type: item.type as 'Utama' | 'Tambahan',
    status: item.status as 'Draft' | 'Review' | 'Approved',
    indicators: (item.indicators || []).map((ind: any) => ({
      id: ind.id,
      text: ind.text,
      target: ind.target,
      perspective: ind.perspective
    }))
  });

  const fetchData = async () => {
    setLoading(true);
    
    if (!isSupabaseConfigured || !supabase) {
      console.warn("Menggunakan Demo Mode.");
      setEmployees(MOCK_EMPLOYEES);
      setRhks(MOCK_RHKS);
      
      const saved = localStorage.getItem('currentUser');
      if (saved) {
        const user = JSON.parse(saved);
        const exists = MOCK_EMPLOYEES.find(e => e.nip === user.nip);
        if (exists) setCurrentUser(exists);
      }
      setLoading(false);
      return;
    }

    try {
      const { data: empData, error: empErr } = await supabase.from('employees').select('*');
      const { data: rhkData, error: rhkErr } = await supabase.from('rhks').select('*, indicators(*)');
      
      if (empErr || rhkErr) throw empErr || rhkErr;

      const mappedEmployees = (empData || []).map(mapEmployee);
      const mappedRhks = (rhkData || []).map(mapRHK);

      setEmployees(mappedEmployees);
      setRhks(mappedRhks);

      const saved = localStorage.getItem('currentUser');
      if (saved) {
        const user = JSON.parse(saved);
        const exists = mappedEmployees.find(e => e.nip === user.nip);
        if (exists) setCurrentUser(exists);
      }
    } catch (err) {
      console.error("Gagal memuat data dari Supabase, beralih ke Mock:", err);
      setEmployees(MOCK_EMPLOYEES);
      setRhks(MOCK_RHKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogin = (employee: Employee) => {
    setCurrentUser(employee);
    localStorage.setItem('currentUser', JSON.stringify(employee));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleAddEmployee = async (emp: Employee) => {
    if (!supabase) {
      setEmployees(prev => [...prev, emp]);
      return;
    }
    const { error } = await supabase.from('employees').insert([{
      nip: emp.nip,
      name: emp.name,
      position: emp.position,
      role: emp.role,
      gender: emp.gender,
      superior_id: emp.superiorId || null
    }]);
    if (!error) fetchData();
  };

  const handleBulkAddEmployee = async (newEmployees: Employee[]) => {
    if (!supabase) {
      setEmployees(prev => [...prev, ...newEmployees]);
      return;
    }
    const payload = newEmployees.map(emp => ({
      nip: emp.nip,
      name: emp.name,
      position: emp.position,
      role: emp.role,
      gender: emp.gender,
      superior_id: emp.superiorId || null
    }));
    const { error } = await supabase.from('employees').insert(payload);
    if (!error) fetchData();
  };

  const handleUpdateEmployee = async (emp: Employee) => {
    if (!supabase) {
      setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
      return;
    }
    const { error } = await supabase.from('employees').update({
      nip: emp.nip,
      name: emp.name,
      position: emp.position,
      role: emp.role,
      gender: emp.gender,
      superior_id: emp.superiorId || null
    }).eq('id', emp.id);
    if (!error) fetchData();
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!supabase) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      return;
    }
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) fetchData();
  };

  const handleSaveRhkPersistent = async (rhkData: Partial<RHK>, employeeId: string, parentRhkId?: string) => {
    if (!supabase) {
      const isNew = !rhkData.id || rhkData.id.startsWith('rhk-');
      const newRhk = {
        ...rhkData,
        id: isNew ? `rhk-${Date.now()}` : rhkData.id,
        employeeId,
        parentRhkId,
        indicators: (rhkData.indicators || []).map((ind, i) => ({
          ...ind,
          id: (ind as any).id || `ind-${Date.now()}-${i}`
        }))
      } as RHK;

      if (isNew) setRhks(prev => [...prev, newRhk]);
      else setRhks(prev => prev.map(r => r.id === rhkData.id ? newRhk : r));
      return;
    }

    try {
      const isNew = !rhkData.id || rhkData.id.startsWith('rhk-');
      const rhkPayload = {
        employee_id: employeeId,
        parent_rhk_id: parentRhkId || null,
        title: rhkData.title,
        description: rhkData.description,
        type: rhkData.type || 'Utama',
        status: rhkData.status || 'Draft'
      };

      let rhkId = rhkData.id;
      if (isNew) {
        const { data, error } = await supabase.from('rhks').insert([rhkPayload]).select();
        if (error) throw error;
        rhkId = data[0].id;
      } else {
        const { error } = await supabase.from('rhks').update(rhkPayload).eq('id', rhkId);
        if (error) throw error;
      }

      await supabase.from('indicators').delete().eq('rhk_id', rhkId);
      
      if (rhkData.indicators && rhkData.indicators.length > 0) {
        const indPayload = rhkData.indicators.map(ind => ({
          rhk_id: rhkId,
          text: ind.text,
          target: ind.target,
          perspective: ind.perspective
        }));
        await supabase.from('indicators').insert(indPayload);
      }

      await fetchData();
    } catch (err) {
      console.error("Gagal menyimpan RHK:", err);
    }
  };

  const handleDeleteRhk = async (id: string) => {
    if (!supabase) {
      setRhks(prev => prev.filter(r => r.id !== id));
      return;
    }
    const { error } = await supabase.from('rhks').delete().eq('id', id);
    if (!error) fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-400 font-bold tracking-widest animate-pulse uppercase text-xs">Memuat Aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login employees={employees} onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === Role.ADMIN;

  return (
    <Router>
      <Layout currentUser={currentUser} onLogout={handleLogout}>
        {!isSupabaseConfigured && (
          <div className="mb-6 bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-amber-800">Demo Mode: Menggunakan data lokal sementara.</p>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={isAdmin ? <Dashboard employees={employees} rhks={rhks} /> : <Navigate to="/my-skp" replace />} />
          <Route path="/matrix" element={isAdmin ? <CascadingMatrix employees={employees} rhks={rhks} onUpdateRhks={setRhks} onSaveRhkRemote={handleSaveRhkPersistent} onDeleteRhkRemote={handleDeleteRhk} onUpdateEmployees={setEmployees} /> : <Navigate to="/my-skp" replace />} />
          <Route path="/employees" element={isAdmin ? <EmployeeManagement employees={employees} onAdd={handleAddEmployee} onBulkAdd={handleBulkAddEmployee} onUpdate={handleUpdateEmployee} onDelete={handleDeleteEmployee} /> : <Navigate to="/my-skp" replace />} />
          <Route path="/settings" element={isAdmin ? <Settings /> : <Navigate to="/my-skp" replace />} />
          <Route path="/my-skp" element={<MySkp employee={currentUser} rhks={rhks} employees={employees} />} />
          <Route path="*" element={<Navigate to={isAdmin ? "/" : "/my-skp"} replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
