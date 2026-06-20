import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@inicia.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>INICIA</h1>
          <p className="subtitle">Facility Management</p>
        </div>

        <h2>Iniciar Sesión</h2>
        <p className="login-description">Accede a tu calendario de vacaciones</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-footer">
          <p>Email: admin@inicia.com<br/>Contraseña: password</p>
        </div>
      </div>
    </div>
  );
}
