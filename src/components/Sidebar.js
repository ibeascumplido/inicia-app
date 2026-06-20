import React from 'react';
import './Sidebar.css';

export default function Sidebar({ user, onLogout, onNavigate, currentPage, notifications }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🏢</span>
          <span className="logo-text">INICIA</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Inicio</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'my-calendar' ? 'active' : ''}`}
          onClick={() => onNavigate('my-calendar')}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-label">Mi Calendario</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'budgets' ? 'active' : ''}`}
          onClick={() => onNavigate('budgets')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Presupuestos</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'calendars' ? 'active' : ''}`}
          onClick={() => onNavigate('calendars')}
        >
          <span className="nav-icon">📆</span>
          <span className="nav-label">Calendarios</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}
          onClick={() => onNavigate('users')}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-label">Usuarios</span>
          {notifications > 0 && <span className="badge">{notifications}</span>}
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user.name.charAt(0)}</div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
