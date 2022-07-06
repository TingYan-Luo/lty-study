import { useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';

import PersonMove from './person-move';
import PersonRotate from './person-rotate';
import Environment from './env';
import Steps from './steps';
import InputControl from './inputControl';
import Axis from './axis';
import PersonMove3 from './person-move-3';
import PersonControler from './person-controler';

const BabylonSquare: React.FC<any> = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) {
      const engine = new BABYLON.Engine(
        ref.current,
        true,
        {
          deterministicLockstep: true,
          lockstepMaxSteps: 4,
        },
        false,
      );
      const scene = new BABYLON.Scene(engine);
      // scene.createDefaultCamera(true, false, true);
      scene.createDefaultLight();

      const input = new InputControl(scene);

      // const person = new PersonMove3(
      //   'https://',
      //   input,
      //   scene,
      // );
      const env = new Environment(scene);

      // const person = new PersonRotate(
      //   'https://',
      //   // input,
      //   scene,
      // );

      new PersonControler(scene);

      // new Steps(scene);

      // const axis = new Axis(scene);
      engine.runRenderLoop(() => {
        scene.render();
      });
      scene.debugLayer.show();
    }
  }, []);
  return (
    <div className="canvas-container">
      <canvas ref={ref} />
    </div>
  );
};

export default BabylonSquare;
