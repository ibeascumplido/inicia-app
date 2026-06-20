import React, { useState } from 'react';
import './BudgetDetail.css';

export default function BudgetDetail({ budget, onClose, onUpdate }) {
  const [formData, setFormData] = useState({...budget});
  const [materials, setMaterials] = useState([
    { id: 1, nombre: 'Material 1', cantidad: 1, precio: 100, iva: 21, margen: 10 }
  ]);

  const addMaterial = () => {
    setMaterials([...materials, { 
      id: Math.max(...materials.map(m => m.id), 0) + 1,
      nombre: '',
      cantidad: 1,
      precio: 0,
      iva: 21,
      margen: 10
    }]);
  };

  const updateMaterial = (id, field, value) => {
    setMaterials(materials.map(m => m.id === id ? {...m, [field]: value} : m));
  };

  const deleteMaterial = (id) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const calculateTotal = () => {
    return materials.reduce((sum, m) => {
      const base = (m.cantidad * m.precio) || 0;
      const withMargin = base * (1 + (m.margen || 0) / 100);
      const withIva = withMargin * (1 + (m.iva || 0) / 100);
      return sum + withIva;
    }, 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalle Presupuesto: {formData.numero}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="detail-form">
            <div className="form-row">
              <div className="form-group">
                <label>Cliente</label>
                <input value={formData.cliente} onChange={(e) => setFormData({...formData, cliente: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción de Servicios</label>
              <textarea rows="3" placeholder="Describe los servicios..."></textarea>
            </div>

            <div className="materials-section">
              <h4>Descripción de Materiales</h4>
              <table className="materials-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>IVA %</th>
                    <th>Margen %</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(m => {
                    const base = (m.cantidad * m.precio) || 0;
                    const withMargin = base * (1 + (m.margen || 0) / 100);
                    const total = withMargin * (1 + (m.iva || 0) / 100);
                    return (
                      <tr key={m.id}>
                        <td>
                          <input value={m.nombre} onChange={(e) => updateMaterial(m.id, 'nombre', e.target.value)} />
                        </td>
                        <td>
                          <input type="number" value={m.cantidad} onChange={(e) => updateMaterial(m.id, 'cantidad', parseInt(e.target.value))} />
                        </td>
                        <td>
                          <input type="number" value={m.precio} onChange={(e) => updateMaterial(m.id, 'precio', parseFloat(e.target.value))} />
                        </td>
                        <td>
                          <input type="number" value={m.iva} onChange={(e) => updateMaterial(m.id, 'iva', parseInt(e.target.value))} />
                        </td>
                        <td>
                          <input type="number" value={m.margen} onChange={(e) => updateMaterial(m.id, 'margen', parseInt(e.target.value))} />
                        </td>
                        <td className="total">${total.toFixed(2)}</td>
                        <td>
                          <button onClick={() => deleteMaterial(m.id)} className="btn-delete">🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <button onClick={addMaterial} className="btn btn-small">+ Añadir Material</button>
            </div>

            <div className="total-section">
              <h3>Total Presupuesto: ${calculateTotal().toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => { onUpdate(formData.id, formData); onClose(); }}>Guardar Cambios</button>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
