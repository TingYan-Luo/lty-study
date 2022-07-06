import { FC, useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { appleMaterial, groundMaterial } from '../material';
import moment from 'moment';

const SnakeGame: FC<any> = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [apple, setApple] = useState<BABYLON.Mesh>();
  const [snake, setSnake] = useState<BABYLON.Mesh>();

  const cameraPosition = new BABYLON.Vector3(0, 10, 0);
  const groundParam = {
    width: 40,
    height: 50,
  };

  const appleInitPostion = new BABYLON.Vector3(0, 1, 0);

  const createApple = (scene: BABYLON.Scene) => {
    const appleMain = BABYLON.MeshBuilder.CreateSphere(
      'apple',
      { diameter: 2 },
      scene,
    );
    appleMain.translate(appleInitPostion, 1);
    appleMain.material = appleMaterial(scene);

    setApple(appleMain);

    return appleMain;
  };

  const createSnake = (scene: BABYLON.Scene) => {
    const snakeMain = BABYLON.MeshBuilder.CreateCylinder(
      'snake-body',
      { height: 5, diameter: 2 },
      scene,
    );
    snakeMain.rotation.z = BABYLON.Tools.ToRadians(90);
    snakeMain.position.y = 1;

    const snakeHead = BABYLON.MeshBuilder.CreateSphere(
      'snake-head',
      { diameter: 2 },
      scene,
    );
    snakeHead.position.y = 1;
    snakeHead.position.x = 5 / 2;
    snakeHead.setParent(snakeMain);

    snakeMain.rotation.y = BABYLON.Tools.ToRadians(90);
    snakeMain.translate(new BABYLON.Vector3(0, 14, 2), 1);
    setSnake(snakeMain);

    return snakeMain;
  };

  const goOn = (box: BABYLON.Mesh) => {
    // console.log(box.position.z);
    const frame = new BABYLON.Animation(
      'goOn',
      'position.z',
      1,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE,
    );
    const keyFrame = [
      {
        frame: 0,
        value: box.position.z,
      },
      {
        frame: 1,
        value: box.position.z + 1,
      },
    ];
    frame.setKeys(keyFrame);
    box.animations.push(frame);

    return frame;
  };

  const initGUI = (scene: BABYLON.Scene) => {
    const myGUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      'myUi',
      true,
      scene,
    );

    // 时间展示
    const TEXT_TIME = new GUI.TextBlock('time');
    TEXT_TIME.text = moment().format('YYYY-MM-DD HH:mm:ss');
    TEXT_TIME.color = 'white';
    TEXT_TIME.fontSize = 24;
    TEXT_TIME.top = '-40%';
    TEXT_TIME.left = '38%';

    // 开始按钮
    const BTN_START = GUI.Button.CreateSimpleButton('btn-start', 'start');
    BTN_START.width = '60px';
    BTN_START.height = '30px';
    BTN_START.top = '-30%';
    BTN_START.left = '38%';
    BTN_START.background = 'red';
    BTN_START.color = 'white';

    // 结束按钮
    const BTN_END = GUI.Button.CreateSimpleButton('btn-end', 'end');
    BTN_END.width = '60px';
    BTN_END.height = '30px';
    BTN_END.top = '-30%';
    BTN_END.left = '42%';
    BTN_END.background = 'white';
    BTN_END.color = 'black';

    // BTN_START.onPointerClickObservable.add(() => {
    //   scene.beginAnimation(snake, 0, 1500, true);
    // });

    myGUI.addControl(TEXT_TIME);
    myGUI.addControl(BTN_START);
    myGUI.addControl(BTN_END);

    return myGUI;
  };

  const init = async () => {
    const engine = new BABYLON.Engine(ref.current);
    const scene = new BABYLON.Scene(engine);
    engine.runRenderLoop(() => {
      scene.render();
    });

    scene.debugLayer.show();
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);

    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      0,
      0,
      30,
      cameraPosition,
      scene,
    );
    camera.attachControl(ref.current, false, true);
    camera.wheelDeltaPercentage = 0.01;

    const light = new BABYLON.HemisphericLight('light', cameraPosition, scene);
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      groundParam,
      scene,
    );
    ground.material = groundMaterial(scene);

    createApple(scene);
    const mSnake = createSnake(scene);
    const rightFrame = goOn(mSnake);

    // scene.beginAnimation(mSnake, 0, 1500, true);
    const gui = initGUI(scene);
    const BTN_START = gui.getChildren()[0].getChildByName('btn-start');
    const BTN_END = gui.getChildren()[0].getChildByName('btn-end');

    BTN_START?.onPointerClickObservable.add(() => {
      scene.beginAnimation(mSnake, 0, 1500, true);
    });

    BTN_END?.onPointerClickObservable.add(() => {
      scene.stopAnimation(mSnake);
    });
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={ref} />
    </div>
  );
};

export default SnakeGame;
