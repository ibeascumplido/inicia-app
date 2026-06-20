import React, { useState, useMemo } from 'react';
import './Users.css';

export default function Users({ users, onUpdate, onApprove, onReject, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [editingId, setEditingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = filterStatus === 'Todos' || u.status === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [users, searchTerm, filterStatus]);

  const stats = {
    total: users.length,
    pendientes: users.filter(u => u.status === 'Pendiente').length,
    aprobados: users.filter(u => u.status === 'Aprobado').length,
    admins: users.filter(u => u.role === 'Admin').length
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditingUser({...user});
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      onUpdate(editingId, editingUser);
      setEditingId(null);
      setEditingUser(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Gestión de Usuarios</h1>
        <p className="page-subtitle">Administra los accesos y permisos</p>
      </div>

      <div className="users-stats">
        <div className="stat-box">
          <div className="stat-icon">👥</div>
          <div className="stat-data">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total usuarios</div>
          </div>
        </div>

        <div className="stat-box pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-data">
            <div className="stat-value">{stats.pendientes}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>

        <div className="stat-box approved">
          <div className="stat-icon">✓</div>
          <div className="stat-data">
            <div className="stat-value">{stats.aprobados}</div>
            <div className="stat-label">Aprobados</div>
          </div>
        </div>

        <div className="stat-box admin">
          <div className="stat-icon">🛡️</div>
          <div className="stat-data">
            <div className="stat-value">{stats.admins}</div>
            <div className="stat-label">Administradores</div>
          </div>
        </div>
      </div>

      <div className="users-toolbar">
        <input 
          type="text" 
          placeholder="Buscar por nombre o email..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option>Todos</option>
          <option>Pendiente</option>
          <option>Aprobado</option>
          <option>Rechazado</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>USUARIO</th>
              <th>ESTADO</th>
              <th>ROL</th>
              <th>VACACIONES</th>
              <th>DÍAS LIBRES</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td className="number">{user.vacaciones}</td>
                <td className="number">{user.dias_libres}</td>
                <td className="actions">
                  <button className="action-btn edit" onClick={() => handleEdit(user)} title="Editar">✏️</button>
                  {user.status === 'Pendiente' && (
                    <>
                      <button className="action-btn approve" onClick={() => onApprove(user.id)} title="Aprobar">✓</button>
                      <button className="action-btn reject" onClick={() => onReject(user.id)} title="Rechazar">✕</button>
                    </>
                  )}
                  {user.id !== 1 && (
                    <button className="action-btn delete" onClick={() => onDelete(user.id)} title="Eliminar">🗑️</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && editingUser && (
        <div className="modal-overlay" onClick={() => setEditingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Usuario</h3>
              <button className="modal-close" onClick={() => setEditingId(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select 
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option>Admin</option>
                  <option>Usuario</option>
                </select>
              </div>

              <div className="form-group">
                <label>Vacaciones</label>
                <input
                  type="number"
                  value={editingUser.vacaciones}
                  onChange={(e) => setEditingUser({...editingUser, vacaciones: parseInt(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label>Días Libres</label>
                <input
                  type="number"
                  value={editingUser.dias_libres}
                  onChange={(e) => setEditingUser({...editingUser, dias_libres: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleSaveEdit}>Guardar Cambios</button>
              <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
