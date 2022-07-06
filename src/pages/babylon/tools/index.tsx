import { SkyMaterial } from 'babylonjs-materials';
import {
  Scene,
  MeshBuilder,
  Animation,
  Mesh,
  AxesViewer,
  Engine,
} from 'babylonjs';
import { Button, AdvancedDynamicTexture } from 'babylonjs-gui';
import { debounce } from 'lodash';

/** 天空材质 */
export const InitSky = (scene: Scene, control?: boolean) => {
  const skybox = MeshBuilder.CreateBox('skyBox', { size: 10000 }, scene);
  const skyboxMaterial = new SkyMaterial('skyBox', scene);
  skyboxMaterial.backFaceCulling = false;
  skybox.material = skyboxMaterial;
  skybox.infiniteDistance = true;
  skybox.isPickable = false;

  /*
   * Keys:
   * - 1: Day
   * - 2: Evening
   * - 3: Increase Luminance
   * - 4: Decrease Luminance
   * - 5: Increase Turbidity
   * - 6: Decrease Turbidity
   * - 7: Move horizon to -50
   * - 8: Restore horizon to 0
   */
  const setSkyConfig = (property: any, from: any, to: any) => {
    const keys = [
      { frame: 0, value: from },
      { frame: 100, value: to },
    ];

    const animation = new Animation(
      'animation',
      property,
      100,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );
    animation.setKeys(keys);

    scene.stopAnimation(skybox);
    scene.beginDirectAnimation(skybox, [animation], 0, 100, false, 1);
  };

  if (control) {
    window.addEventListener('keydown', function (evt) {
      switch (evt.keyCode) {
        case 49:
          setSkyConfig('material.inclination', skyboxMaterial.inclination, 0);
          break; // 1
        case 50:
          setSkyConfig(
            'material.inclination',
            skyboxMaterial.inclination,
            -0.5,
          );
          break; // 2

        case 51:
          setSkyConfig('material.luminance', skyboxMaterial.luminance, 0.1);
          break; // 3
        case 52:
          setSkyConfig('material.luminance', skyboxMaterial.luminance, 1.0);
          break; // 4

        case 53:
          setSkyConfig('material.turbidity', skyboxMaterial.turbidity, 40);
          break; // 5
        case 54:
          setSkyConfig('material.turbidity', skyboxMaterial.turbidity, 5);
          break; // 6

        case 55:
          setSkyConfig(
            'material.cameraOffset.y',
            skyboxMaterial.cameraOffset.y,
            50,
          );
          break; // 7
        case 56:
          setSkyConfig(
            'material.cameraOffset.y',
            skyboxMaterial.cameraOffset.y,
            0,
          );
          break; // 8
        default:
          break;
      }
    });
  }

  // Set to Day
  setSkyConfig('material.inclination', skyboxMaterial.inclination, 0);
};

/**
 * 给物体添加坐标轴
 * @param mesh 物体
 * @param scene 场景
 */
export const AxisWrapper = (mesh: Mesh, length: number, scene: Scene) => {
  const axes = new AxesViewer(scene, length);
  axes.xAxis.parent = mesh;
  axes.yAxis.parent = mesh;
  axes.zAxis.parent = mesh;
};

/**
 * 创建GUI按钮
 * @param id 按钮id
 * @param label 按钮文本
 * @param styles 按钮样式配置
 * @param GUI 2D GUI对象
 */
export const CreateButton = (
  id: string,
  label: string,
  styles: Record<string, string>,
  GUI: AdvancedDynamicTexture,
) => {
  const button = Button.CreateSimpleButton(id, label);
  if (styles && Object.keys(styles).length) {
    Object.entries(styles).forEach((item) => {
      // @ts-ignore
      button[item[0]] = item[1];
    });
  }
  console.log(button);
  GUI.addControl(button);
};

/**
 * 位移动画
 * @param mesh
 * @param position
 * @returns
 */
export const AnimationMove = (
  mesh: BABYLON.Mesh | BABYLON.ArcRotateCamera | BABYLON.AbstractMesh,
  position: BABYLON.Vector3,
) => {
  const frame = new BABYLON.Animation(
    'move',
    'position',
    1,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE,
  );

  const keyFrame = [
    {
      frame: 0,
      value: mesh.position,
    },
    {
      frame: 1,
      value: position,
    },
  ];

  frame.setKeys(keyFrame);
  mesh.animations.push(frame);

  return frame;
};

/** 优化场景 */
export const OptimizeScene = (scene: Scene) => {
  scene.freezeMaterials();
  scene.meshes.forEach((m) => {
    m.isPickable = false;
    m.alwaysSelectAsActiveMesh = true;
    m.freezeWorldMatrix();
  });
  setTimeout(() => {
    scene.freezeActiveMeshes();
  }, 1000);
};

/**
 * 优化canvas
 * @param canvas canvas对象
 * @param engine 引擎
 */
export const OptimizeCanvas = (canvas: HTMLCanvasElement, engine: Engine) => {
  if (canvas) {
    // 防止触控板双指缩放导致页面缩放
    canvas.addEventListener('wheel', (e: any) => {
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
  window.addEventListener(
    'resize',
    debounce((e: any) => {
      engine.resize();
    }),
  );

  return () => {
    window.removeEventListener('resize', () => {
      console.log('remove');
    });
  };
};

/**
 * 开发环境【ctrl+shift+r】打开/关闭调试层
 * @param isDev 是否为开发环境
 * @param e 按键事件
 * @param scene 场景
 */
export const ShortcutsDebug = (
  isDev: boolean,
  e: React.KeyboardEvent<HTMLCanvasElement>,
  scene: Scene,
) => {
  if (isDev && e.ctrlKey && e.shiftKey && (e.key === 'R' || e.keyCode === 82)) {
    if (scene.debugLayer.isVisible()) {
      scene.debugLayer.hide();
    } else {
      scene.debugLayer.show({
        embedMode: true,
      });
    }
  }
};
