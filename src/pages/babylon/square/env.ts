import * as BABYLON from 'babylonjs';
import { groundMaterial } from '../material';

export default class Environment {
  /** 场景 */
  public _scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene) {
    this._scene = scene;
    this.loadGround();
  }

  private async loadGround(): Promise<void> {
    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { height: 50, width: 50, subdivisions: 4 },
      this._scene,
    );
    ground.material = groundMaterial(this._scene);
    ground.checkCollisions = true;
    // ground.isEnabled();
    ground.isPickable = true;
    // ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    //   ground,
    //   BABYLON.PhysicsImpostor.BoxImpostor,
    //   {
    //     mass: 0,
    //     friction: 1,
    //   },
    //   this._scene,
    // );
    // const result = await BABYLON.SceneLoader.ImportMeshAsync(
    //   null,
    //   '',
    //   'book-scene.glb',
    //   this._scene,
    // );
    // result.meshes[0].id = '__root-scene__';
    // result.meshes[0].name = '__root-scene__';
    // result.meshes[0].isPickable = true;
    // result.meshes[0].scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
    // result.meshes[0].getChildMeshes().forEach((m) => {
    //   m.isPickable = true;
    //   m.checkCollisions = true;
    // });
  }
}
