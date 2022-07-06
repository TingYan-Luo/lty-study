import * as BABYLON from 'babylonjs';

export default class Steps extends BABYLON.TransformNode {
  constructor(scene: BABYLON.Scene) {
    super('steps', scene);

    this.create();
  }

  private create() {
    const floor_1 = BABYLON.MeshBuilder.CreateBox(
      'floor_1',
      {
        width: 10,
        height: 4,
        depth: 10,
      },
      this._scene,
    );
    floor_1.position = new BABYLON.Vector3(10, 2, 10);
    floor_1.checkCollisions = true;

    const floor_2 = floor_1.clone('floor_2');
    floor_2.position = new BABYLON.Vector3(0, -1, 10);
  }
}
