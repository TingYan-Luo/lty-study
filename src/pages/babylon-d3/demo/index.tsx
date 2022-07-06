import React, { useEffect } from 'react';
import * as BABYLON from 'babylonjs';
import * as D3 from 'd3';

export default function Index() {
  const init = () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (canvas) {
      const engine = new BABYLON.Engine(canvas);
      const scene = new BABYLON.Scene(engine);
      scene.createDefaultCamera(true, false, true);
      scene.createDefaultLight();

      engine.runRenderLoop(() => {
        scene.render();
      });
      scene.debugLayer.show();

      D3.select('canvas');
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="canvas-container">
      <canvas id="canvas" />
    </div>
  );
}
