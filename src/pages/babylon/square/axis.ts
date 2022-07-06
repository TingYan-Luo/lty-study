import * as BABYLON from 'babylonjs';

export default class Axis {
  private _scene: BABYLON.Scene;
  private _position: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  private _length: number = 10;

  constructor(
    scene: BABYLON.Scene,
    position?: BABYLON.Vector3,
    length?: number,
  ) {
    this._scene = scene;
    if (position) {
      this._position = position;
    }
    if (length) {
      this._length = length;
    }
    this.create();
  }

  private create() {
    const dot = BABYLON.MeshBuilder.CreateSphere(
      'axis',
      {
        diameter: 1,
      },
      this._scene,
    );
    dot.position = this._position;

    const axes = new BABYLON.AxesViewer(this._scene, this._length);
    axes.xAxis.parent = dot;
    axes.yAxis.parent = dot;
    axes.zAxis.parent = dot;

    dot.visibility = 0;
  }
}
