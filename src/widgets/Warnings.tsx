import React from 'react';

function Warnings ({ onToggle }) {
  return (
    <>
      <div className="heading" onClick={onToggle}>
        <span>Warnings</span>
        <span className="pill pill-warning">27</span>
        <span className="pill pill-danger">3</span>
      </div>
      <div style={{ padding: '12px' }}>
        Not implemented
      </div>
    </>
  );
}

export default Warnings;
