import * as BABYLON from 'babylonjs';
import { Ray, RayHelper } from 'babylonjs';
import InputControl from './inputControl';
import * as CANNON from 'cannon';

export default class PersonMove3 {
  private static readonly PERSON_URL = 'girl-cartoon.glb';
  /** 初始角度 */
  private static readonly ORIGINAL_TILT: BABYLON.Vector3 = new BABYLON.Vector3(
    0.5934119456780721,
    0,
    0,
  );
  /** 重力 */
  private static readonly GRAVITY: number = -0.28;
  /** 跳跃力 */
  private static readonly JUMP_FORCE: number = 0.2;

  /** 场景 */
  public _scene: BABYLON.Scene;

  /** 人物跟随相机 */
  public _camera!: BABYLON.ArcRotateCamera;
  public _camRoot: BABYLON.TransformNode | undefined;

  private _input: InputControl;

  /** 人物网格 */
  private person_mesh!: BABYLON.Mesh;
  private person_ray: BABYLON.Ray | undefined;

  /** 人物：走路速度 */
  public readonly walk_speed: number = 0.05;
  public readonly run_speed: number = 0.1;

  /** 是否在动画运行中 */
  private animating: boolean = false;

  /** 人物动画-走路 */
  private anim_walk: BABYLON.AnimationGroup | undefined;
  /** 人物动画-跑步 */
  private anim_run: BABYLON.AnimationGroup | undefined;
  /** 人物动画-站立 */
  private anim_idle: BABYLON.AnimationGroup | undefined;

  // 地面
  /** 是否在地面上 */
  public isGrounded: boolean = true;
  /** 重力 */
  public _gravity: BABYLON.Vector3 = new BABYLON.Vector3();
  /** 跳跃次数 */
  public _jumpCount: number = 1;
  /** 是否在跳跃中 */
  public _jumped: boolean = false;
  /** 是否在下落中 */
  public _isFalling: boolean = false;

  public _prevFrameTime: number | undefined;
  public _onObject: boolean = false;

  public direction = new BABYLON.Vector3();
  public velocity = new BABYLON.Vector3();

  constructor(url: string, input: InputControl, scene: BABYLON.Scene) {
    this._scene = scene;
    this._input = input;

    this.loadCamera();

    const physEngine = new BABYLON.CannonJSPlugin(false, undefined, CANNON);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), physEngine);
    physEngine.setTimeStep(1 / 60);

    // this.load();

    this.importMesh(PersonMove3.PERSON_URL);

    this._scene.registerBeforeRender(() => {
      this._beforeRenderUpdate();
      // this._updateCamera();
    });
  }

  /**
   * 加载摄像机
   */
  private loadCamera = () => {
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 4,
      5,
      new BABYLON.Vector3(),
      this._scene,
    );
    camera.attachControl(this._scene.getEngine().getRenderingCanvas(), true);

    const cameraTargetMesh = BABYLON.MeshBuilder.CreateBox(
      'cameraTargetMesh',
      { height: 2 },
      this._scene,
    );
    cameraTargetMesh.visibility = 0;
    cameraTargetMesh.position = new BABYLON.Vector3(0, 0, 0);
    camera.lockedTarget = cameraTargetMesh;
    this._camRoot = cameraTargetMesh;

    this._scene.activeCamera = camera;
    this._camera = camera;
  };

  /** 停止移动，站立动作 */
  private idle = () => {
    this.anim_run!.stop();
    this.anim_walk!.stop();
    this.anim_idle!.play();
  };

  /** 动画 */
  private _animatePlayer = () => {
    if (this._input.runKey) {
      this.anim_run!.play();
      this.anim_walk!.stop();
      this.anim_idle!.stop();
    } else if (
      this._input.input_states['w'] ||
      this._input.input_states['s'] ||
      this._input.input_states['a'] ||
      this._input.input_states['d']
    ) {
      this.anim_walk!.play();
      this.anim_run!.stop();
      this.anim_idle!.stop();
    } else {
      this.idle();
    }
  };

  /** 渲染时更新函数 */
  private _beforeRenderUpdate(): void {
    // this._updateFromControls();
    this._input.command.frameTime = Date.now();
    this._input.command.cameraAlpha = this._camera.alpha;
    this._input.command.cameraBeta = this._camera.beta;
    if (this.person_mesh) {
      this._updateMove();
    }
  }

  /** 导入模型 */
  private async importMesh(url: string): Promise<void> {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      url,
      this._scene,
    );
    const body = result.meshes[0] as BABYLON.Mesh;
    this.person_mesh = body;

    this.person_mesh.checkCollisions = true;
    // this.person_mesh.isPickable = false;
    this.person_mesh.position = new BABYLON.Vector3(0, 0.2, 0);
    this.person_mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.person_mesh,
      BABYLON.PhysicsImpostor.NoImpostor,
      {
        mass: 1,
        friction: 0,
      },
      this._scene,
    );
    this.person_mesh.physicsImpostor.physicsBody.angularDamping = 1;
    this.person_mesh.getChildMeshes().forEach((m) => {
      m.isPickable = false;
      m.physicsImpostor = new BABYLON.PhysicsImpostor(
        m,
        BABYLON.PhysicsImpostor.SphereImpostor,
        {
          mass: 0,
        },
        this._scene,
      );
    });
    this._camRoot?.setParent(this.person_mesh);

    // 辅助射线
    const ray = new BABYLON.Ray(
      new BABYLON.Vector3(
        this.person_mesh.position.x,
        this.person_mesh.position.y + 0.5,
        this.person_mesh.position.z,
      ),
      new BABYLON.Vector3(0, -1, 0),
      0.5,
    );
    const rayHelper = new BABYLON.RayHelper(ray);
    rayHelper.attachToMesh(
      this.person_mesh,
      new BABYLON.Vector3(0, -1, 0),
      new BABYLON.Vector3(0, 0.1, 0),
      0.2,
    );
    rayHelper.show(this._scene, new BABYLON.Color3(1, 0, 0));
    this.person_ray = ray;

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
    // this.idle();
  }

  /** 角色跳跃 */
  private jump(): void {
    this.person_mesh.physicsImpostor!.wakeUp();
    this.person_mesh.physicsImpostor!.setLinearVelocity(
      new BABYLON.Vector3(0, 7, 0),
    );
    this._onObject = false;
  }

  /** 角色位移 */
  private _updateMove(): void {
    if (this._prevFrameTime === undefined) {
      this._prevFrameTime = this._input.command.frameTime;
      return;
    }
    const command = this._input.command;
    // let onObject = false;
    const delta = command.frameTime - this._prevFrameTime;

    const pick = this._scene.pickWithRay(this.person_ray!);

    // 在地面上/物体上就可以跳跃
    if (pick) this._onObject = pick.hit;
    // console.log(this._onObject);

    const viewAngleY = 2 * Math.PI - command.cameraAlpha;
    this.person_mesh.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(
      0,
      viewAngleY,
      0,
    );

    this.direction.x = -(
      Number(command.moveForwardKeyDown) - Number(command.moveBackwardKeyDown)
    );
    this.direction.z =
      Number(command.moveRightKeyDown) - Number(command.moveLeftKeyDown);
    this.direction.normalize();

    this.velocity.x = 0;
    this.velocity.z = 0;
    if (command.moveRightKeyDown || command.moveLeftKeyDown) {
      this.velocity.z = (this.direction.z * delta) / 300;
    }
    if (command.moveForwardKeyDown || command.moveBackwardKeyDown) {
      this.velocity.x = (this.direction.x * delta) / 300;
    }

    if (command.jumpKeyDown && this._onObject) {
      this.jump();
    }

    const rotationAxis = BABYLON.Matrix.RotationAxis(
      BABYLON.Axis.Y,
      viewAngleY,
    );
    const rotatedVelocity = BABYLON.Vector3.TransformCoordinates(
      this.velocity.multiplyByFloats(1, delta / 10, 1),
      rotationAxis,
    );

    if (this.person_mesh && this.person_mesh.physicsImpostor) {
      this.person_mesh.physicsImpostor.setAngularVelocity(
        new BABYLON.Vector3(),
      );
      if (this.velocity.z !== 0 || this.velocity.x !== 0) {
        this.person_mesh.physicsImpostor.wakeUp();
        const old = this.person_mesh.physicsImpostor.getLinearVelocity();
        old!.x = 0;
        old!.z = 0;
        const add = old!.add(rotatedVelocity.scale(50));
        this.person_mesh.physicsImpostor.setLinearVelocity(add);
      } else {
        if (this._onObject) this.person_mesh.physicsImpostor.sleep();
        const old = this.person_mesh.physicsImpostor.getLinearVelocity();
        old!.x = 0;
        old!.z = 0;
        this.person_mesh.physicsImpostor.setLinearVelocity(old);
      }
    }

    this._prevFrameTime = command.frameTime;
  }
}
