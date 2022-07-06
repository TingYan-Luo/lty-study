import * as BABYLON from 'babylonjs';
import { CharacterController } from 'babylonjs-charactercontroller';

export default class PersonControler {
  private static readonly PERSON_URL = '/babylon/girl-cartoon.glb';
  private _scene: BABYLON.Scene;
  private person_mesh: BABYLON.Mesh;
  private _camera: BABYLON.ArcRotateCamera;

  public controler: CharacterController;

  /** 人物动画-走路 */
  private anim_walk: BABYLON.AnimationGroup | undefined;
  /** 人物动画-跑步 */
  private anim_run: BABYLON.AnimationGroup | undefined;
  /** 人物动画-站立 */
  private anim_idle: BABYLON.AnimationGroup | undefined;

  constructor(scene: BABYLON.Scene) {
    this._scene = scene;
    this.loadCamera();
    this.importMesh();
  }

  /**
   * 加载摄像机
   */
  private loadCamera = () => {
    const cameraName = 'camera-person';
    const camera = new BABYLON.ArcRotateCamera(
      cameraName,
      -Math.PI / 2,
      Math.PI / 4,
      5,
      this.person_mesh?.position,
      this._scene,
    );

    camera.attachControl(this._scene.getEngine().getRenderingCanvas(), true);

    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 30;

    camera.panningSensibility = 0; // 禁止摄像机平移

    this._scene.activeCamera = camera;
    this._camera = camera;
  };

  /** 停止移动，站立动作 */
  private idle = () => {
    this.anim_run?.stop();
    this.anim_walk?.stop();
    this.anim_idle?.play();
  };

  /** 导入模型 */
  private importMesh = async () => {
    const person = BABYLON.MeshBuilder.CreateBox(
      'person',
      {
        width: 1,
        height: 0.001,
        depth: 1,
      },
      this._scene,
    );
    person.visibility = 0;
    // person.position = new BABYLON.Vector3(0, 1, 0);

    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      PersonControler.PERSON_URL,
      '',
      this._scene,
    );
    const importPerson = result.meshes[0] as BABYLON.Mesh;
    importPerson.parent = person;

    // this.person_mesh = result.meshes[0] as BABYLON.Mesh;
    this.person_mesh = person;

    this.person_mesh.position = BABYLON.Vector3.Zero();
    this.person_mesh.checkCollisions = true;
    this.person_mesh.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    this.person_mesh.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

    // 模型缩小
    // this.person_mesh.scaling.scaleInPlace(0.1);

    // 骨骼动画
    this.anim_walk = result.animationGroups.find(
      (item) => item.name === 'walking',
    );
    this.anim_run = result.animationGroups.find(
      (item) => item.name === 'fast_run',
    );
    this.anim_idle = result.animationGroups.find(
      (item) => item.name === 'idle',
    );

    // 初始人物站立
    this.idle();
    this.initControler();
  };

  private initControler() {
    const cc = new CharacterController(
      this.person_mesh,
      this._camera,
      this._scene,
      {
        walk: this.anim_walk,
        run: this.anim_run,
        idle: this.anim_idle,
      },
    );
    cc.setFaceForward(true);
    cc.setMode(0);
    cc.setTurnSpeed(45);
    //below makes the controller point the camera at the player head which is approx
    //1.5m above the player origin
    cc.setCameraTarget(new BABYLON.Vector3(0, 0.5, 0));

    //if the camera comes close to the player we want to enter first person mode.
    cc.setNoFirstPerson(true);
    //the height of steps which the player can climb
    cc.setStepOffset(0.4);
    //the minimum and maximum slope the player can go up
    //between the two the player will start sliding down if it stops
    cc.setSlopeLimit(30, 60);
    cc.setTurningOff(true);

    //tell controller
    // - which animation range should be used for which player animation
    // - rate at which to play that animation range
    // - wether the animation range should be looped
    //use this if name, rate or looping is different from default
    // if (this.anim_idle && this.anim_walk && this.anim_run) {
    //   cc.setIdleAnim(this.anim_idle, 1, true);
    //   cc.setTurnLeftAnim(this.anim_walk, 0.5, true);
    //   cc.setTurnRightAnim(this.anim_walk, 0.5, true);
    //   cc.setWalkBackAnim(this.anim_walk, 0.5, true);
    //   cc.setIdleJumpAnim(this.anim_walk, 0.5, false);
    //   cc.setRunJumpAnim(this.anim_run, 0.6, false);
    //   cc.setFallAnim(this.anim_walk, 2, false);
    //   cc.setSlideBackAnim(this.anim_walk, 1, false);
    //   cc.start();
    // }
    // cc.setIdleAnim('idle', 1, true);
    // cc.setTurnLeftAnim('walk', 0.5, true);
    // cc.setTurnRightAnim('walk', 0.5, true);
    // cc.setWalkBackAnim('walk', 0.5, true);
    // cc.setIdleJumpAnim('walk', 0.5, false);
    // cc.setRunJumpAnim('run', 0.6, false);
    // cc.setFallAnim('walk', 2, false);
    // cc.setSlideBackAnim('walk', 1, false);
    cc.start();
    // cc.setAvatar(result.meshes[0]);
    console.log(cc.getActionMap());

    this.controler = cc;
  }
}
