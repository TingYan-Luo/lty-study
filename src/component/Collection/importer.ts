import * as BABYLON from 'babylonjs';
import { ImporterOptionTypes } from './index';

/**
 * 导入模型
 */
export default class Importer {
  private static readonly DEFAULT_ENV = '/babylon/file/environmentSpecular.env';
  // 'https://s.newscdn.cn/collection-components/environmentSpecular.env';

  private _scene: BABYLON.Scene;
  private _options: ImporterOptionTypes = {};
  private _currentPluginName: string | undefined;

  public _importMesh: BABYLON.Mesh | BABYLON.AbstractMesh | undefined;
  public _isGltf: boolean = false;

  constructor(
    url: string,
    options: ImporterOptionTypes,
    scene: BABYLON.Scene,
    onLoad?: Function,
  ) {
    this._scene = scene;
    this._options = options;
    this.importMesh(url, onLoad);
  }

  private async importMesh(url: string, onLoad?: Function) {
    const { envUrl = Importer.DEFAULT_ENV } = this._options;
    const skyboxTexture = new BABYLON.CubeTexture(envUrl, this._scene);

    BABYLON.SceneLoader.OnPluginActivatedObservable.add((plugin) => {
      this._currentPluginName = plugin.name;
    });

    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      url,
      '',
      this._scene,
    );
    const importMesh = result.meshes[0] as BABYLON.Mesh;

    // 兼容从沙盒中导出的文件
    if (result.meshes.length > 1) {
      result.meshes.forEach((mesh) => {
        if (mesh.material?.getClassName() == 'PBRMaterial') {
          const currentMaterial = mesh.material as BABYLON.PBRMaterial;
          currentMaterial.reflectionTexture = skyboxTexture;
          mesh.material = currentMaterial;
        }

        if (['__root__', 'hdrSkyBox'].includes(mesh.id)) {
          return;
        }

        mesh.setParent(importMesh);
      });
    }

    this._importMesh = importMesh;

    this._importMesh.normalizeToUnitCube();

    this.updateCamera(importMesh);

    onLoad && onLoad();
  }

  private updateCamera(target: BABYLON.Mesh | BABYLON.AbstractMesh) {
    // this._scene.skipFrustumClipping = true;
    const camera = this._scene.activeCamera as BABYLON.ArcRotateCamera;

    if (camera) {
      // camera.attachControl();
      // 获取场景中物体边界
      const worldExtends = this._scene.getWorldExtends();

      const boundingInfo = new BABYLON.BoundingInfo(
        worldExtends.min,
        worldExtends.max,
      );
      target.refreshBoundingInfo();
      // 获取盒子中心位置
      const centerPoint = boundingInfo.boundingBox.center.scale(-1);
      // console.log('worldExtends', worldExtends);
      // console.log('center', centerPoint);

      // target.showBoundingBox = true;
      // const targetBounding = target.getHierarchyBoundingVectors();
      // const targetBoundingInfo = new BABYLON.BoundingInfo(
      //   targetBounding.min,
      //   targetBounding.max,
      // );
      // const targetCenter = targetBoundingInfo.boundingBox.center.scale(1);
      // console.log('targetBoundingInfo', targetBoundingInfo);
      // console.log('targetCenter', targetCenter);

      target.position = centerPoint;
      // target.translate(new BABYLON.Vector3(0, 1, 0), centerPoint._y);
      (target as BABYLON.Mesh).bakeCurrentTransformIntoVertices();
      // (target as BABYLON.Mesh).bakeTransformIntoVertices(centerPoint);
      // TODO: 中心判定有问题
      // Enable camera's behaviors
      camera.useFramingBehavior = true;
      const framingBehavior = camera.getBehaviorByName(
        'Framing',
      ) as BABYLON.FramingBehavior;

      // 摄像机框架行为：根据边界信息缩放
      // framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
      framingBehavior.zoomOnMeshesHierarchy(this._scene.meshes);
      // framingBehavior.mode = BABYLON.FramingBehavior.FitFrustumSidesMode;

      // target.setPivotPoint(target.getBoundingInfo().boundingBox.centerWorld);

      camera.beta = this._options.camera?.beta || 1.4;
      camera.alpha = this._options.camera?.alpha || Math.PI / 2;
      camera.radius = this._options.camera?.radius || 1.8;

      // camera.target = target.getBoundingInfo().boundingBox.centerWorld;
      if (this._currentPluginName === 'gltf') {
        // glTF assets use a +Z forward convention while the default camera faces +Z. Rotate the camera to look at the front of the asset.
        camera.alpha += Math.PI;
        target.rotate(
          new BABYLON.Vector3(0, 1, 0),
          Math.PI,
          BABYLON.Space.WORLD,
        );
        this._isGltf = true;
      }

      if (this._options.camera?.autoRotate) {
        this._scene.getEngine()?.runRenderLoop(() => {
          camera.alpha -= 0.003;
        });
      }
    }
  }
}
