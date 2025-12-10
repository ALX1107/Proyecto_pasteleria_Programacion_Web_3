// src/components/PasswordStrengthIndicator.jsx
import React from 'react';

const PasswordStrengthIndicator = ({ strength, score, message }) => {
  if (!strength) return null;

  const getColor = () => {
    switch (strength) {
      case 'débil': return '#ff4444';
      case 'normal': return '#ffaa00';
      case 'segura': return '#44aa44';
      default: return '#666';
    }
  };

  const getWidth = () => {
    return `${(score / 5) * 100}%`;
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: getWidth(),
          height: '100%',
          backgroundColor: getColor(),
          transition: 'width 0.3s ease'
        }} />
      </div>
      <div style={{
        marginTop: '4px',
        fontSize: '12px',
        color: getColor(),
        fontWeight: 'bold'
      }}>
        Contraseña {strength}: {message}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;