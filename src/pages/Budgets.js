import React, { useState, useMemo } from 'react';
import './Budgets.css';
import BudgetDetail from './BudgetDetail';

export default function Budgets({ budgets, onAdd, onUpdate, onDelete, onApprove }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [formData, setFormData] = useState({
    numero: '',
    cliente: '',
    direccion: '',
    total: '',
    estado: 'Pendiente',
    fecha: new Date().toISOString().split('T')[0]
  });

  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const matchSearch = b.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = filterEstado === 'Todos' || b.estado === filterEstado;
      return matchSearch && matchFilter;
    });
  }, [budgets, searchTerm, filterEstado]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      cliente: '',
      direccion: '',
      total: '',
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const handleEdit = (budget) => {
    setFormData(budget);
    setEditingId(budget.id);
    setShowForm(true);
  };

  const viewingBudget = budgets.find(b => b.id === viewingId);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Presupuestos</h1>
        <p className="page-subtitle">Gestiona todos tus presupuestos</p>
      </div>

      <div className="budgets-toolbar">
        <input 
          type="text" 
          placeholder="Buscar por número o cliente..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="filter-select"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option>Todos</option>
          <option>Pendiente</option>
          <option>Aprobado</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + Nuevo Presupuesto
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Número</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  placeholder="P-0001/25"
                  required
                />
              </div>
              <div className="form-group">
                <label>Cliente</label>
                <input
                  type="text"
                  value={formData.cliente}
                  onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Dirección"
                />
              </div>
              <div className="form-group">
                <label>Total (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total}
                  onChange={(e) => setFormData({...formData, total: parseFloat(e.target.value)})}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select 
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <option>Pendiente</option>
                  <option>Aprobado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Guardar Cambios' : 'Crear Presupuesto'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>N° PRESUPUESTO</th>
              <th>CLIENTE</th>
              <th>TOTAL</th>
              <th>ESTADO</th>
              <th>FECHA</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredBudgets.map(budget => (
              <tr key={budget.id}>
                <td><strong>{budget.numero}</strong></td>
                <td>
                  <div>
                    <div>{budget.cliente}</div>
                    <div className="small">{budget.direccion}</div>
                  </div>
                </td>
                <td>${budget.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${budget.estado.toLowerCase()}`}>
                    {budget.estado}
                  </span>
                </td>
                <td>{new Date(budget.fecha).toLocaleDateString('es-ES')}</td>
                <td className="actions">
                  <button className="action-btn view" onClick={() => setViewingId(budget.id)} title="Ver">👁️</button>
                  <button className="action-btn edit" onClick={() => handleEdit(budget)} title="Editar">✏️</button>
                  {budget.estado === 'Pendiente' && (
                    <button className="action-btn approve" onClick={() => onApprove(budget.id)} title="Aprobar">✓</button>
                  )}
                  <button className="action-btn delete" onClick={() => onDelete(budget.id)} title="Eliminar">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingBudget && (
        <BudgetDetail 
          budget={viewingBudget} 
          onClose={() => setViewingId(null)} 
          onUpdate={onUpdate} 
        />
      )}
    </div>
  );
}
