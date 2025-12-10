// src/components/Input.jsx
import React from 'react';

const Input = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        className="styled-input"
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        required
      />
    </div>
  );
};

export default Input;
