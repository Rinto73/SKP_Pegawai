
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
  const [initError, setInitError] = useState<string | null>(null);

  const mapEmployee = (item: any): Employee => ({
    id: item.id,
    nip: item.nip,
    name: item.name,
    position: item.position,
    role: item.role as Role,
    gender: item.gender as 'L' | 'P',
    superiorId: item.superior_id,
    isPartTime: item.is_part_time
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
    try {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) {
        setEmployees(MOCK_EMPLOYEES);
        setRhks(MOCK_RHKS);
        const saved = localStorage.getItem('currentUser');
        if (saved) {
          try {
            const user = JSON.parse(saved);
            const exists = MOCK_EMPLOYEES.find(e => e.nip === user.nip);
            if (exists) setCurrentUser(exists);
          } catch(e) { localStorage.removeItem('currentUser'); }
        }
        return;
      }

      const { data: empData, error: empErr } = await supabase.from('employees').select('*');
      const { data: rhkData, error: rhkErr } = await supabase.from('rhks').select('*, indicators(*)');
      
      if (empErr || rhkErr) throw empErr || rhkErr;

      const mappedEmployees = (empData || []).map(mapEmployee);
      const mappedRhks = (rhkData || []).map(mapRHK);

      setEmployees(mappedEmployees);
      setRhks(mappedRhks);

      const saved = localStorage.getItem('currentUser');
      if (saved) {
        try {
          const user = JSON.parse(saved);
          const exists = mappedEmployees.find(e => e.nip === user.nip);
          if (exists) setCurrentUser(exists);
        } catch(e) { localStorage.removeItem('currentUser'); }
      }
    } catch (err: any) {
      console.error("App: Data initialization error:", err);
      setInitError(err.message || "Gagal memuat data dari server.");
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
    if (!supabase) { setEmployees(prev => [...prev, emp]); return; }
    await supabase.from('employees').insert([{ nip: emp.nip, name: emp.name, position: emp.position, role: emp.role, gender: emp.gender, superior_id: emp.superiorId || null, is_part_time: emp.isPartTime }]);
    fetchData();
  };

  const handleBulkAddEmployee = async (newEmployees: Employee[]) => {
    if (!supabase) { setEmployees(prev => [...prev, ...newEmployees]); return; }
    const payload = newEmployees.map(emp => ({ nip: emp.nip, name: emp.name, position: emp.position, role: emp.role, gender: emp.gender, superior_id: emp.superiorId || null, is_part_time: emp.isPartTime }));
    await supabase.from('employees').insert(payload);
    fetchData();
  };

  const handleUpdateEmployee = async (emp: Employee) => {
    if (!supabase) { prev => prev.map(e => e.id === emp.id ? emp : e); return; }
    await supabase.from('employees').update({ nip: emp.nip, name: emp.name, position: emp.position, role: emp.role, gender: emp.gender, superior_id: emp.superiorId || null, is_part_time: emp.isPartTime }).eq('id', emp.id);
    fetchData();
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!supabase) { setEmployees(prev => prev.filter(e => e.id !== id)); return; }
    await supabase.from('employees').delete().eq('id', id);
    fetchData();
  };

  const handleSaveRhkPersistent = async (rhkData: Partial<RHK>, employeeId: string, parentRhkId?: string) => {
    if (!supabase) {
      const isNew = !rhkData.id || rhkData.id.startsWith('rhk-');
      const newRhk = { ...rhkData, id: isNew ? `rhk-${Date.now()}` : rhkData.id, employeeId, parentRhkId, indicators: (rhkData.indicators || []).map((ind, i) => ({ ...ind, id: (ind as any).id || `ind-${Date.now()}-${i}` })) } as RHK;
      if (isNew) setRhks(prev => [...prev, newRhk]);
      else setRhks(prev => prev.map(r => r.id === rhkData.id ? newRhk : r));
      return;
    }
    try {
      const isNew = !rhkData.id || rhkData.id.startsWith('rhk-');
      const rhkPayload = { employee_id: employeeId, parent_rhk_id: parentRhkId || null, title: rhkData.title, description: rhkData.description, type: rhkData.type || 'Utama', status: rhkData.status || 'Draft' };
      let rhkId = rhkData.id;
      if (isNew) {
        const { data, error } = await supabase.from('rhks').insert([rhkPayload]).select();
        if (error) throw error;
        rhkId = data[0].id;
      } else {
        await supabase.from('rhks').update(rhkPayload).eq('id', rhkId);
      }
      await supabase.from('indicators').delete().eq('rhk_id', rhkId);
      if (rhkData.indicators && rhkData.indicators.length > 0) {
        const indPayload = rhkData.indicators.map(ind => ({ rhk_id: rhkId, text: ind.text, target: ind.target, perspective: ind.perspective }));
        await supabase.from('indicators').insert(indPayload);
      }
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteRhk = async (id: string) => {
    if (!supabase) { setRhks(prev => prev.filter(r => r.id !== id)); return; }
    await supabase.from('rhks').delete().eq('id', id);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-400 font-bold tracking-widest animate-pulse uppercase text-xs">Memuat Data SKP...</p>
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
