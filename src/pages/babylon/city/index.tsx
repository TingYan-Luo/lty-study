import { FC, useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import * as Loader from 'babylonjs-loaders';
import 'babylonjs-inspector';
import { CreateButton, InitSky } from '../tools';

import styles from './index.less';
import moment from 'moment';

const cameraPosition = new BABYLON.Vector3(-1230, 330, -925);

const meshList = ['cityTower_1', 'cityTower_2', 'cityTower_3'];

// 巨坑！！！！要注册
BABYLON.SceneLoader.RegisterPlugin(new Loader.GLTFFileLoader());
// BABYLON.SceneLoader.RegisterPlugin(new Loader.OBJFileLoader());

const BabylonCity: FC<any> = () => {
  const ref = useRef<any>(null);

  const cameraToTarget = (
    camera: BABYLON.FreeCamera,
    newPos: BABYLON.Vector3,
    rotaY: number,
  ) => {
    const ease = new BABYLON.CubicEase();

    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    BABYLON.Animation.CreateAndStartAnimation(
      'cameraMove',
      camera,
      'position',
      1,
      10,
      camera.target,
      newPos,
      0,
      ease,
    );
    BABYLON.Animation.CreateAndStartAnimation(
      'cameraRotate',
      camera,
      'rotation.y',
      1,
      5,
      camera.rotation.y,
      rotaY,
      0,
      ease,
    );
    BABYLON.Animation.CreateAndStartAnimation(
      'cameraRotate',
      camera,
      'rotation.z',
      1,
      5,
      camera.rotation.z,
      0,
      0,
      ease,
    );
  };

  const initGUI = (scene: BABYLON.Scene) => {
    const myGUI = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      'myUi',
      true,
      scene,
    );

    const buttonStyle = {
      width: '100px',
      height: '30px',
      top: '-30%',
      left: '38%',
      background: 'red',
      color: 'white',
    };
    // 东方明珠
    CreateButton(meshList[0], '东方明珠', buttonStyle, myGUI);
    CreateButton(
      meshList[1],
      '中心',
      { ...buttonStyle, top: '-20%', background: 'white', color: 'black' },
      myGUI,
    );
    CreateButton(
      meshList[2],
      '金融',
      { ...buttonStyle, top: '-10%', background: 'green', color: 'white' },
      myGUI,
    );
    CreateButton(
      'clear',
      '返回',
      { ...buttonStyle, top: '0%', background: 'black', color: 'white' },
      myGUI,
    );

    return myGUI;
  };

  const activeAnimation = (
    mesh: BABYLON.AbstractMesh | null,
    scene: BABYLON.Scene,
  ) => {
    const noActive = meshList.filter((item) => item !== mesh?.name);
    noActive.forEach((item) => {
      const otherMesh = scene.getMeshByName(item);
      if (otherMesh) {
        BABYLON.Animation.CreateAndStartAnimation(
          'active',
          otherMesh,
          'visibility',
          1,
          10,
          otherMesh.visibility,
          1,
          0,
        );
      }
    });
    if (mesh) {
      BABYLON.Animation.CreateAndStartAnimation(
        'active',
        mesh,
        'visibility',
        1,
        10,
        1,
        0.3,
        0,
      );
    }
  };

  const createAction = (mesh: BABYLON.AbstractMesh, scene: BABYLON.Scene) => {
    // console.log(mesh.material);
    // const material_hover = new BABYLON.StandardMaterial('hover', scene);
    // material_hover.emissiveColor = new BABYLON.Color3(1, 1, 1);
    // // const material = mesh.material;
    // const multimat = new BABYLON.MultiMaterial(`multi-${mesh.name}`, scene);
    // multimat.subMaterials.push(mesh.material);
    // multimat.subMaterials.push(material_hover);

    // mesh.material = multimat;

    // 新增动作管理器
    mesh.actionManager = new BABYLON.ActionManager(scene);

    // 创建动作实例-直接改变数据
    // const hoverAction = new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh, 'material', material_hover);
    // const outAction = new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh, 'material', mesh.material);

    const hoverAction = new BABYLON.InterpolateValueAction(
      BABYLON.ActionManager.OnPointerOverTrigger,
      mesh,
      'visibility',
      0.7,
      500,
    );
    const outAction = new BABYLON.InterpolateValueAction(
      BABYLON.ActionManager.OnPointerOutTrigger,
      mesh,
      'visibility',
      1,
      500,
    );
    // const clickAction = new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPickTrigger, mesh, 'visibility', 0.7, 500);
    // const noAction = new BABYLON.InterpolateValueAction(BABYLON.ActionManager.NothingTrigger, mesh, 'visibility', 1, 500);

    // 注册操作
    mesh.actionManager.registerAction(hoverAction);
    mesh.actionManager.registerAction(outAction);
    // mesh.actionManager.registerAction(clickAction);
    // mesh.actionManager.registerAction(noAction);
  };

  const meshWrapper = (scene: BABYLON.Scene, camera: BABYLON.FreeCamera) => {
    const myGUI = initGUI(scene);
    meshList.forEach((item) => {
      const BTN_START = myGUI.getChildren()[0].getChildByName(item);
      const mesh = scene.getMeshByName(item);
      if (mesh) {
        BTN_START?.onPointerClickObservable.add(() => {
          const position = new BABYLON.Vector3(
            mesh.position._x,
            300,
            mesh.position._z,
          );
          activeAnimation(mesh, scene);
          cameraToTarget(camera, position, 0.5);

          // mesh.visibility = 0.7;
        });
        // mesh.isPickable = true;
        createAction(mesh, scene);
      }
    });

    const BTN_CLEAR = myGUI.getChildren()[0].getChildByName('clear');
    BTN_CLEAR?.onPointerClickObservable.add(() => {
      activeAnimation(null, scene);
      cameraToTarget(camera, cameraPosition, 0.75);
    });
  };

  /** 导入城市模型 */
  const importCity = (scene: BABYLON.Scene, callback?: () => void) => {
    scene.useRightHandedSystem = true;
    BABYLON.SceneLoader.Append(
      '',
      'ShanghaiModel-3.gltf', // 模型巨大，删除了
      scene,
      (scene) => {
        console.log('success', scene);
        callback && callback();
      },
      (e) => {
        console.log('progress', e);
      },
      (scene, message) => {
        console.log('error', message, scene);
      },
    );
  };

  /** 初始化 */
  const init = () => {
    const engine = new BABYLON.Engine(ref.current);

    // 创建场景
    const scene = new BABYLON.Scene(engine);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const camera = new BABYLON.FreeCamera(
      'camera',
      cameraPosition,
      scene,
      true,
    );
    // const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene); // 3.2 1.0 10
    camera.attachControl(ref.current, true);
    camera.rotation.y = 0.83;
    camera.rotation.x = 0.25;
    // camera.setTarget(cameraPosition);

    camera.speed = 20;
    /** 灯光 */
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 3000, 0),
      scene,
    );
    // 调整光照强度
    light.intensity = 1;

    // const center = BABYLON.MeshBuilder.CreateSphere('center', { diameter: 0.1 }, scene);

    InitSky(scene);

    const currentTime = moment().valueOf();
    importCity(scene, () => {
      meshWrapper(scene, camera);
      console.log('加载建模耗时：', moment().valueOf() - currentTime);
    });

    scene.debugLayer.show({
      // embedMode: true,
    });
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="canvas-container">
      <canvas
        onScroll={(e) => e.preventDefault()}
        ref={ref}
        // style={{ width: '100%', height: 800 }}
      />
    </div>
  );
};

export default BabylonCity;
