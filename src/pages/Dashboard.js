import React from 'react';
import './Dashboard.css';

export default function Dashboard({ user, budgets, users, pendingCount, onNavigate }) {
  const approvedBudgets = budgets.filter(b => b.estado === 'Aprobado').reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Hola, {user.name}</h1>
        <p className="page-subtitle">Resumen de tu actividad</p>
      </div>

      <div className="dashboard-grid">
        <div className="metric-card vacation">
          <div className="metric-icon">🏖️</div>
          <div>
            <div className="metric-label">Vacaciones</div>
            <div className="metric-value">/32</div>
            <div className="metric-detail">27 restantes</div>
          </div>
        </div>

        <div className="metric-card days">
          <div className="metric-icon">☀️</div>
          <div>
            <div className="metric-label">Días Libres</div>
            <div className="metric-value">/6</div>
            <div className="metric-detail">6 restantes</div>
          </div>
        </div>

        <div className="metric-card quick">
          <div className="metric-label">Acceso rápido</div>
          <div className="metric-title">Mi Calendario</div>
          <div className="metric-description">Gestiona tus vacaciones</div>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="alert alert-warning">
          <span className="alert-icon">👥</span>
          <div className="alert-content">
            <strong>{pendingCount} {pendingCount === 1 ? 'usuario' : 'usuarios'} pendientes de aprobación</strong>
          </div>
          <button className="alert-button" onClick={() => onNavigate('users')}>
            Revisar →
          </button>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div>
            <div className="stat-label">Total Presupuestos</div>
            <div className="stat-value">{budgets.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <div className="stat-label">Pendientes</div>
            <div className="stat-value">{budgets.filter(b => b.estado === 'Pendiente').length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <div className="stat-label">Aprobados (sin IVA)</div>
            <div className="stat-value">${approvedBudgets.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div>
            <div className="stat-label">Gestión Usuarios</div>
            <div className="stat-value">{users.length}</div>
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Presupuestos Recientes</h3>
        <table className="table">
          <thead>
            <tr>
              <th>N° PRESUPUESTO</th>
              <th>CLIENTE</th>
              <th>TOTAL</th>
              <th>ESTADO</th>
              <th>FECHA</th>
            </tr>
          </thead>
          <tbody>
            {budgets.slice(0, 3).map(budget => (
              <tr key={budget.id}>
                <td>{budget.numero}</td>
                <td>{budget.cliente}</td>
                <td>${budget.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${budget.estado.toLowerCase()}`}>
                    {budget.estado}
                  </span>
                </td>
                <td>{new Date(budget.fecha).toLocaleDateString('es-ES')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
