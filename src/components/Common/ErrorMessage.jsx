import React from 'react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div style={{
      background: '#f8d7da',
      color: '#721c24',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      {message}
    </div>
  );
};

export default ErrorMessage;