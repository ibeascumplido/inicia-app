import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import Users from './pages/Users';
import Calendars from './pages/Calendars';
import MyCalendar from './pages/MyCalendar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toast, setToast] = useState(null);
  
  const [budgets, setBudgets] = useState([
    { id: 1, numero: 'P-9318/25', cliente: 'Construcciones García S.L.', direccion: 'C/ Mayor 45, Local 2', total: 1720.14, estado: 'Aprobado', fecha: '2025-12-21' },
    { id: 2, numero: 'P-8317/25', cliente: 'Hotel Mediterráneo S.A.', direccion: 'Av. del Puerto 123, Planta 4', total: 2295.13, estado: 'Pendiente', fecha: '2025-12-21' },
    { id: 3, numero: 'P-0608/25', cliente: 'Test Cliente S.L.', direccion: 'Calle Test 123', total: 1474.99, estado: 'Pendiente', fecha: '2025-12-21' }
  ]);
  
  const [users, setUsers] = useState([
    { id: 1, name: 'Administrador', email: 'admin@inicia.com', role: 'Admin', status: 'Aprobado', vacaciones: 32, dias_libres: 6 },
    { id: 2, name: 'Daniel ibeas', email: 'ibeascuplido@gmail.com', role: 'Usuario', status: 'Aprobado', vacaciones: 32, dias_libres: 6 },
    { id: 3, name: 'Test User', email: 'test@inicia.com', role: 'Usuario', status: 'Aprobado', vacaciones: 32, dias_libres: 6 },
    { id: 4, name: 'Test User 2', email: 'test2@inicia.com', role: 'Usuario', status: 'Pendiente', vacaciones: 32, dias_libres: 6 },
    { id: 5, name: 'Test Register User', email: 'testregister@inicia.com', role: 'Usuario', status: 'Pendiente', vacaciones: 32, dias_libres: 6 },
    { id: 6, name: 'UI Test User', email: 'uitest@inicia.com', role: 'Usuario', status: 'Pendiente', vacaciones: 32, dias_libres: 6 }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (email, password) => {
    if (email === 'admin@inicia.com' && password === 'password') {
      const userData = { id: 1, name: 'Administrador', email: 'admin@inicia.com', role: 'Admin' };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentPage('dashboard');
      showToast('¡Sesión iniciada correctamente!', 'success');
    } else {
      showToast('Email o contraseña incorrectos', 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('login');
    showToast('Sesión cerrada', 'success');
  };

  const addBudget = (newBudget) => {
    setBudgets([...budgets, { ...newBudget, id: Math.max(...budgets.map(b => b.id), 0) + 1 }]);
    showToast('Presupuesto creado exitosamente', 'success');
  };

  const updateBudget = (id, updatedBudget) => {
    setBudgets(budgets.map(b => b.id === id ? { ...updatedBudget, id } : b));
    showToast('Presupuesto actualizado exitosamente', 'success');
  };

  const deleteBudget = (id) => {
    setBudgets(budgets.filter(b => b.id !== id));
    showToast('Presupuesto eliminado', 'success');
  };

  const approveBudget = (id) => {
    setBudgets(budgets.map(b => b.id === id ? { ...b, estado: 'Aprobado' } : b));
    showToast('Presupuesto aprobado', 'success');
  };

  const updateUser = (id, updatedUser) => {
    setUsers(users.map(u => u.id === id ? { ...updatedUser, id } : u));
    showToast('Usuario actualizado exitosamente', 'success');
  };

  const approveUser = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Aprobado' } : u));
    showToast('Usuario aprobado', 'success');
  };

  const rejectUser = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Rechazado' } : u));
    showToast('Usuario rechazado', 'success');
  };

  const deleteUser = (id) => {
    if (id === 1) {
      showToast('No se puede eliminar el administrador', 'error');
      return;
    }
    setUsers(users.filter(u => u.id !== id));
    showToast('Usuario eliminado', 'success');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <Sidebar user={user} onLogout={handleLogout} onNavigate={setCurrentPage} currentPage={currentPage} notifications={users.filter(u => u.status === 'Pendiente').length} />
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard user={user} budgets={budgets} users={users} pendingCount={users.filter(u => u.status === 'Pendiente').length} onNavigate={setCurrentPage} />}
        {currentPage === 'budgets' && <Budgets budgets={budgets} onAdd={addBudget} onUpdate={updateBudget} onDelete={deleteBudget} onApprove={approveBudget} />}
        {currentPage === 'users' && <Users users={users} onUpdate={updateUser} onApprove={approveUser} onReject={rejectUser} onDelete={deleteUser} />}
        {currentPage === 'calendars' && <Calendars users={users} />}
        {currentPage === 'my-calendar' && <MyCalendar user={user} onShowToast={showToast} />}
      </main>
    </div>
  );
}

export default App;
