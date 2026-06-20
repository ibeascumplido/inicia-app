import React from 'react';
import './Toast.css';

export default function Toast({ message, type }) {
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
    </div>
  );
}
