import { useEffect, useState } from 'react';
import * as BABYLON from 'babylonjs';
import { InitSky, ShortcutsDebug } from '../tools';
import styles from './index.less';
import { appleMaterial } from '../material';
import { debounce } from 'lodash';

const id = 'babylon-picture';
const importPathAsync = 'picture.glb';

const BabylonPicture: React.FC<any> = () => {
  const [iScene, setIScene] = useState<BABYLON.Scene | null>(null);

  /** 处理切割 */
  const handleSubstract = debounce((init, hide, scene: BABYLON.Scene) => {
    /** CSG-整体画纸 */
    const initCSG = BABYLON.CSG.FromMesh(init, true);
    /** CSG-遮盖盒子 */
    const hideCSG = BABYLON.CSG.FromMesh(hide, true);
    /** 画纸-盒子 */
    const booleanCSG1 = initCSG.subtract(hideCSG);
    const old_mesh = scene.getMeshById('newMesh') as BABYLON.Mesh;
    scene.removeMesh(old_mesh);
    booleanCSG1.toMesh('newMesh', init.material, scene, true);
  });

  /** 拖拽动作 */
  const initDrag = (
    meshs: Record<string, BABYLON.Mesh>,
    hightLayer: BABYLON.HighlightLayer,
    scene: BABYLON.Scene,
  ) => {
    const { mesh_right, mesh_hide, mesh_painting } = meshs;
    /** 拖拽行为 */
    const dragBehavior = new BABYLON.PointerDragBehavior({
      dragAxis: new BABYLON.Vector3(1, 0, 0),
    });
    dragBehavior.useObjectOrientationForDragging = false;
    dragBehavior.updateDragPlane = false;

    dragBehavior.onDragStartObservable.add((e, state) => {
      console.log('start---->', mesh_right.position._x, e);
      hightLayer.addMesh(mesh_right, BABYLON.Color3.Red());
    });
    dragBehavior.onDragObservable.add((e, state) => {
      if (mesh_right.position.x < -370) {
        mesh_hide.position.x = -370;
        mesh_hide.position.x = 250 + 2;
        handleSubstract(mesh_painting, mesh_hide, scene);
        return;
      }
      const target_x = mesh_right.position.x;
      console.log(
        'proccess---->',
        target_x,
        e.dragDistance,
        target_x - e.dragDistance,
      );
      mesh_hide.translate(new BABYLON.Vector3(1, 0, 0), e.dragDistance);
      mesh_right.translate(new BABYLON.Vector3(1, 0, 0), e.dragDistance);

      handleSubstract(mesh_painting, mesh_hide, scene);
    });
    dragBehavior.onDragEndObservable.add((e, state) => {
      console.log('end---->', mesh_right.position.x, mesh_hide.position.x);
      hightLayer.removeMesh(mesh_right);
    });
    mesh_right.addBehavior(dragBehavior);
  };

  /** 展开动画 */
  const expandAnimation = (
    meshs: Record<string, BABYLON.Mesh>,
    camera: any,
  ) => {
    const { mesh_hide, mesh_right } = meshs;
    BABYLON.Animation.CreateAndStartAnimation(
      'mesh_hide_move',
      mesh_hide,
      'position.x',
      1,
      10,
      mesh_hide.position.x,
      mesh_hide.position.x + 50,
      0,
    );
    BABYLON.Animation.CreateAndStartAnimation(
      'mesh_right_move',
      mesh_right,
      'position.x',
      1,
      10,
      mesh_right.position.x,
      mesh_right.position.x + 50,
      0,
    );
    // BABYLON.Animation.CreateAndStartAnimation('camera_move', camera, 'position', 1, 10, camera.target, mesh_right.position, 0);
  };

  /** 导入模型 */
  const importMesh = (scene: BABYLON.Scene, callback?: () => void) => {
    scene.useRightHandedSystem = true;
    BABYLON.SceneLoader.Append(
      '',
      importPathAsync,
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

  const init = async () => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;

    if (canvas) {
      const engine = new BABYLON.Engine(canvas);
      // 创建场景
      const scene = new BABYLON.Scene(engine);

      // setIScene(scene);

      const camera = new BABYLON.ArcRotateCamera(
        'camera-my',
        Math.PI / 2,
        Math.PI / 2.5,
        50,
        // new BABYLON.Vector3(-185, 0, 0),
        new BABYLON.Vector3(0, 0, 0),
        scene,
      );
      camera.attachControl(canvas, true);
      scene.createDefaultLight();

      // camera.speed = 20;
      // camera.pinchPrecision = 1;
      // camera.lowerRadiusLimit = 5;
      // camera.upperRadiusLimit = 50;

      // const light_1 = new BABYLON.HemisphericLight(
      //   'light1',
      //   new BABYLON.Vector3(-0.1, -0.3, 1),
      //   scene,
      // );
      // light_1.diffuse = new BABYLON.Color3(1, 0.85, 0.85);

      InitSky(scene);

      // /** 模型自发光层 */
      // const hightLayer = new BABYLON.HighlightLayer('hl1', scene);
      // hightLayer.innerGlow = false;

      // importMesh(scene, () => {
      /** 创建遮挡盒子 */
      // const mesh_hide = BABYLON.MeshBuilder.CreateBox(
      //   'hider',
      //   { width: 500, height: 30, depth: 4 },
      //   scene,
      // );
      // mesh_hide.position.x = 250 + 2; // 2：卷轴之间的间隙
      // mesh_hide.isPickable = false;
      // // 合并paintings
      // /** 画纸组合 */
      // const mesh_paper_group = scene.getTransformNodeById('painting');
      // /** 左边卷轴组合 */
      // const mesh_scroll_left_group =
      //   scene.getTransformNodeById('mesh_scroll_1');
      // /** 右边卷轴组合 */
      // const mesh_scroll_right_group =
      //   scene.getTransformNodeById('mesh_scroll_2');
      // if (
      //   mesh_paper_group &&
      //   mesh_scroll_left_group &&
      //   mesh_scroll_right_group
      // ) {
      //   const paper_child = mesh_paper_group.getChildMeshes();
      //   const scroll_left_child = mesh_scroll_left_group.getChildMeshes();
      //   const scroll_right_child = mesh_scroll_right_group.getChildMeshes();
      //   /** 合并画纸 */
      //   const mesh_painting = BABYLON.Mesh.MergeMeshes(
      //     paper_child as BABYLON.Mesh[],
      //     true,
      //     true,
      //     undefined,
      //     true,
      //     true,
      //   );
      //   const mesh_left = BABYLON.Mesh.MergeMeshes(
      //     scroll_left_child as BABYLON.Mesh[],
      //     true,
      //     true,
      //     undefined,
      //     true,
      //     true,
      //   );
      //   const mesh_right = BABYLON.Mesh.MergeMeshes(
      //     scroll_right_child as BABYLON.Mesh[],
      //     true,
      //     true,
      //     undefined,
      //     true,
      //     true,
      //   );
      //   if (mesh_painting && mesh_left && mesh_right) {
      //     mesh_painting.id = 'mesh_painting';
      //     mesh_left.id = 'mesh_left';
      //     mesh_right.id = 'mesh_right';
      //     mesh_right.position.x = -370;
      //     mesh_right.isPickable = true;
      //     // initDrag({
      //     //   'mesh_hide': mesh_hide,
      //     //   'mesh_painting': mesh_painting,
      //     //   'mesh_right': mesh_right,
      //     // }, hightLayer, scene);
      //     mesh_painting.visibility = 0;
      //     mesh_hide.visibility = 0;
      //     // handleSubstract(mesh_painting, mesh_hide, scene);
      //     mesh_right.onAfterWorldMatrixUpdateObservable.add(
      //       debounce(() => {
      //         console.log('onAfterWorldMatrixUpdateObservable');
      //         console.log(camera.target);
      //         handleSubstract(mesh_painting, mesh_hide, scene);
      //       }),
      //     );
      //     mesh_right.actionManager = new BABYLON.ActionManager(scene);
      //     if (mesh_right.material) {
      //       // 创建动作实例-为属性设置直接值
      //       // const hoverAction = new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh_right.material, 'emissiveColor', BABYLON.Color3.White());
      //       // const outAction = new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh_right.material, 'emissiveColor', mesh_right.material.emissiveColor);
      //       const action = new BABYLON.ExecuteCodeAction(
      //         BABYLON.ActionManager.OnPickTrigger,
      //         (e) => {
      //           expandAnimation(
      //             {
      //               mesh_hide: mesh_hide,
      //               mesh_right: mesh_right,
      //             },
      //             camera,
      //           );
      //         },
      //       );
      //       // 注册操作
      //       mesh_right.actionManager.registerAction(action);
      //     }
      //   }
      // }

      // });
      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        null,
        '',
        importPathAsync,
        scene,
      );
      scene.debugLayer.show();
      engine.runRenderLoop(() => {
        scene.render();
      });
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="canvas-container">
      <canvas
        id={id}
        onKeyDown={(e) => {
          if (iScene) {
            ShortcutsDebug(true, e, iScene);
          }
        }}
      />
    </div>
  );
};

export default BabylonPicture;
