import { FC, useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
// import * as GUI from 'babylonjs-gui';
import * as Loader from 'babylonjs-loaders';
import 'babylonjs-inspector';
import {
  InitSky,
  OptimizeCanvas,
  OptimizeScene,
  ShortcutsDebug,
} from '../tools';

// import styles from './index.less';
import moment from 'moment';

const importPath = 'tangsancai.glb';

// const cameraPosition = new BABYLON.Vector3(0, 0, 0);

// 巨坑！！！！要注册
BABYLON.SceneLoader.RegisterPlugin(new Loader.GLTFFileLoader());
// BABYLON.SceneLoader.RegisterPlugin(new Loader.OBJFileLoader());

const BabylonPreview: FC<any> = () => {
  const ref = useRef<any>(null);
  const [iScene, setIScene] = useState<BABYLON.Scene | null>(null);

  /** 导入模型 */
  const importMesh = (scene: BABYLON.Scene, callback?: () => void) => {
    scene.useRightHandedSystem = true;
    BABYLON.SceneLoader.Append(
      '',
      importPath,
      scene,
      (scene) => {
        console.log('success', scene);
        // newMeshes[0].optimizeIndices(function() {
        //   newMeshes[0].simplify([{distance:250, quality:0.8}, {distance:300, quality:0.1}, {distance:400, quality:0.3}, {distance:500, quality:0.1}], false, BABYLON.SimplificationType.QUADRATIC, function() {
        //   alert("simplification finished");
        //  });
        // })
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

  // const setLoading = () => {
  //   const dom = document.getElementById('loading');
  //   BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = () => {
  //     if (dom) {
  //       dom.style.display = 'block';
  //     }
  //   }

  //   BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function(){
  //     if (dom) {
  //       dom.style.display = 'none';
  //     }
  //     console.log("scene is now loaded");
  //   }
  // };
  /** 初始化 */
  const init = () => {
    const engine = new BABYLON.Engine(ref.current);

    // 创建场景
    const scene = new BABYLON.Scene(engine);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      0,
      Math.PI / 2.5,
      10,
      new BABYLON.Vector3(0, Math.PI, 0),
      scene,
    ); // 3.2 1.0 10
    camera.attachControl(ref.current, true);
    // camera.setTarget(cameraPosition);

    camera.speed = 20;
    /** 灯光 */
    // const light_1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, Math.PI, 0), scene);
    const light_1 = new BABYLON.DirectionalLight(
      'light1',
      new BABYLON.Vector3(0, 10, 0),
      scene,
    );
    light_1.position = new BABYLON.Vector3(0, 20, 0);

    const light_2 = new BABYLON.DirectionalLight(
      'light1',
      new BABYLON.Vector3(0, -10, 0),
      scene,
    );
    light_2.position = new BABYLON.Vector3(0, -20, 0);
    // 调整光照强度
    // light_1.intensity = 1;

    InitSky(scene);
    // engine.displayLoadingUI();
    const currentTime = moment().valueOf();
    importMesh(scene, () => {
      console.log('加载耗时', moment().valueOf() - currentTime);
      // engine.hideLoadingUI();
      // const textrue = scene.getTextureByName('blinn1 (Base Color)');
      // if (textrue) {
      //   textrue.level = 2;
      // }
      // // console.log('mesh', textrue);
    });

    OptimizeScene(scene);

    setIScene(scene);
  };

  useEffect(() => {
    if (ref.current) {
      init();
      if (iScene) {
        const remove = OptimizeCanvas(ref.current, iScene.getEngine());
        return remove;
      }
    }
  }, [ref]);

  return (
    <div className="canvas-container">
      <canvas
        onKeyDown={(e) => {
          if (iScene) {
            ShortcutsDebug(true, e, iScene);
          }
        }}
        touch-action="none"
        ref={ref}
        // style={{ width: '100%', height: 800, touchAction: 'none' }}
      />
      {/* <div id="loading" style={{ display: 'none' }}>loading</div> */}
    </div>
  );
};

export default BabylonPreview;
