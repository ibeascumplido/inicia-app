import React, { useState } from 'react';
import './MyCalendar.css';

export default function MyCalendar({ user, onShowToast }) {
  const [markType, setMarkType] = useState('vacation');
  const [markedDays, setMarkedDays] = useState({});

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

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

  const handleDayClick = (day) => {
    if (!day) return;
    const dayKey = `${day}`;
    if (markedDays[dayKey] === markType) {
      const newMarked = {...markedDays};
      delete newMarked[dayKey];
      setMarkedDays(newMarked);
    } else {
      setMarkedDays({...markedDays, [dayKey]: markType});
    }
    onShowToast('Solicitud enviada (pendiente de aprobación)', 'success');
  };

  const vacationCount = Object.values(markedDays).filter(v => v === 'vacation').length;
  const dayOffCount = Object.values(markedDays).filter(v => v === 'dayoff').length;

  const monthName = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Mi Calendario</h1>
        <p className="page-subtitle">Gestiona tus vacaciones y días libres</p>
      </div>

      <div className="calendar-container">
        <div className="calendar-summary">
          <div className="summary-card vacations">
            <div className="summary-icon">🏖️</div>
            <div className="summary-info">
              <div className="summary-label">Vacaciones</div>
              <div className="summary-value">{vacationCount}/32</div>
              <div className="summary-rest">{32 - vacationCount} restantes</div>
            </div>
          </div>

          <div className="summary-card pending">
            <div className="summary-icon">⏳</div>
            <div className="summary-info">
              <div className="summary-label">Pendientes</div>
              <div className="summary-value">{vacationCount + dayOffCount}</div>
              <div className="summary-rest">esperando aprobación</div>
            </div>
          </div>

          <div className="summary-card dayoff">
            <div className="summary-icon">☀️</div>
            <div className="summary-info">
              <div className="summary-label">Días Libres</div>
              <div className="summary-value">{dayOffCount}/6</div>
              <div className="summary-rest">{6 - dayOffCount} restantes</div>
            </div>
          </div>

          <div className="summary-card profile">
            <div className="profile-badge">{user.name.charAt(0)}</div>
            <div className="profile-info">
              <div className="profile-name">{user.name}</div>
              <div className="profile-role">{user.role}</div>
            </div>
          </div>
        </div>

        <div className="mark-selector">
          <span>Marcar como:</span>
          <button 
            className={`mark-btn ${markType === 'vacation' ? 'active' : ''}`}
            onClick={() => setMarkType('vacation')}
          >
            🏖️ Vacaciones
          </button>
          <button 
            className={`mark-btn ${markType === 'dayoff' ? 'active' : ''}`}
            onClick={() => setMarkType('dayoff')}
          >
            ☀️ Día Libre
          </button>
        </div>

        <div className="calendar">
          <div className="calendar-month">{monthName.toUpperCase()}</div>
          
          <div className="calendar-weekdays">
            {dayNames.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-days">
            {days.map((day, idx) => {
              const isDayMarked = day && markedDays[`${day}`];
              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`day ${day ? '' : 'empty'} ${isDayMarked ? `marked-${isDayMarked}` : ''} ${day === today.getDate() ? 'today' : ''}`}
                  style={{cursor: day ? 'pointer' : 'default'}}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color today"></div>
            <span>Hoy</span>
          </div>
          <div className="legend-item">
            <div className="legend-color pending"></div>
            <span>Pendiente</span>
          </div>
          <div className="legend-item">
            <div className="legend-color approved"></div>
            <span>Aprobado</span>
          </div>
          <div className="legend-item">
            <div className="legend-color rejected"></div>
            <span>Rechazado</span>
          </div>
          <div className="legend-item">
            <div className="legend-color dayoff-approved"></div>
            <span>Día Libre Aprobado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
