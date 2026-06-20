import React, { useState } from 'react';
import './Calendars.css';

export default function Calendars({ users }) {
  const [filterUser, setFilterUser] = useState('Todos');
  const [viewMode, setViewMode] = useState('month');

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const today = new Date();
    const daysInMonth = getDaysInMonth(today);
    const firstDay = getFirstDayOfMonth(today);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const monthName = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  const days = renderCalendar();
  const pendingCount = users.filter(u => u.status === 'Pendiente').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Calendarios</h1>
        <p className="page-subtitle">Gestión de vacaciones y días libres</p>
      </div>

      <div className="calendars-toolbar">
        <div className="pending-badge">
          <span>⏳ {pendingCount} pendientes</span>
        </div>
        <button className="btn btn-small">📅 Mes</button>
        <button className="btn btn-small">📆 Año</button>
        <select className="filter-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
          <option>Todos los usuarios</option>
          {users.map(u => (
            <option key={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div className="employees-summary">
        <h3>📊 Resumen de Empleados 2026</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th colSpan="3">🏖️ Vacaciones</th>
              <th colSpan="3">☀️ Días Libres</th>
            </tr>
            <tr className="sub-header">
              <th></th>
              <th>Aprobadas</th>
              <th>Pendientes</th>
              <th>Restantes</th>
              <th>Aprobados</th>
              <th>Pendientes</th>
              <th>Restantes</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="employee-cell">
                  <div className="employee-avatar">{user.name.charAt(0)}</div>
                  <div>
                    <div className="employee-name">{user.name}</div>
                    <div className="employee-email">{user.email}</div>
                  </div>
                </td>
                <td className="approved">5</td>
                <td className="pending">2</td>
                <td className="rest">25</td>
                <td className="approved">0</td>
                <td className="pending">0</td>
                <td className="rest">6</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="calendar-view">
        <div className="calendar-nav">
          <button className="nav-btn">←</button>
          <h2>Junio 2026</h2>
          <button className="nav-btn">→</button>
        </div>

        <div className="calendar">
          <div className="calendar-weekdays">
            {dayNames.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-days">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`day ${day ? '' : 'empty'} ${day === 20 ? 'today' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-box pending"></div>
            <span>Pendiente (click para aprobar/rechazar)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box approved"></div>
            <span>Aprobado</span>
          </div>
          <div className="legend-item">
            <div className="legend-box rejected"></div>
            <span>Rechazado</span>
          </div>
        </div>

        <div className="legend-employees">
          <span className="legend-label">Empleados:</span>
          {users.slice(0, 3).map(u => (
            <span key={u.id} className="legend-employee" style={{borderColor: ['#ef4444', '#3b82f6', '#10b981'][users.indexOf(u) % 3]}}>
              {u.name.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
