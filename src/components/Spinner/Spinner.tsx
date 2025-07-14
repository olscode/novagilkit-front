import React from 'react';
import './Spinner.scss';

const Spinner: React.FC = () => (
  <div className="spinner-overlay">
    <div className="spinner">
      <div className="double-bounce1"></div>
      <div className="double-bounce2"></div>
    </div>
  </div>
);

export default Spinner;
