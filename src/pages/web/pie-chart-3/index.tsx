import React from 'react';
import PieChart3D from './PieChart3D';

import MockData from './mock';

const Index = () => {
  return (
    <div className="canvas-container">
      <PieChart3D data={MockData} />
    </div>
  );
};
export default Index;
