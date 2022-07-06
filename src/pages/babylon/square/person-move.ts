import * as BABYLON from 'babylonjs';
import { Ray, RayHelper } from 'babylonjs';
import InputControl from './inputControl';

export default class PersonMove {
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

  /** 帧之间的时间量(毫秒) */
  private _deltaTime: number = 0;
  /** 人物跟随相机 */
  public _camera!: BABYLON.ArcRotateCamera;
  public _camRoot: BABYLON.TransformNode;
  public _yTilt: BABYLON.TransformNode;

  private _input: InputControl;
  private _inputAmt: number;
  public _moveDirection: BABYLON.Vector3;
  private _v: number;
  private _h: number;

  /** 人物网格 */
  private person_mesh!: BABYLON.Mesh;
  private person_ray: BABYLON.Ray;

  /** 人物：走路速度 */
  public readonly walk_speed: number = 0.05;
  public readonly run_speed: number = 0.1;

  /** 是否在动画运行中 */
  private animating: boolean = false;
  // private _canRun: boolean = true;

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

  constructor(url: string, input: InputControl, scene: BABYLON.Scene) {
    this._scene = scene;
    this._input = input;
    this.loadCamera();
    this.importMesh(url);

    this._scene.registerBeforeRender(() => {
      this._beforeRenderUpdate();
      this._updateCamera();
    });
  }

  /**
   * 加载摄像机
   */
  private loadCamera = () => {
    /** 创建摄像机根节点 */
    this._camRoot = new BABYLON.TransformNode('camRoot');
    this._camRoot.position = new BABYLON.Vector3(0, 0.5, 0);
    this._camRoot.rotation = new BABYLON.Vector3(0, 0, 0);

    this._yTilt = new BABYLON.TransformNode('yTilt');
    this._yTilt.rotation = PersonMove.ORIGINAL_TILT;
    this._yTilt.parent = this._camRoot;

    const cameraName = 'camera-person';
    const camera = new BABYLON.ArcRotateCamera(
      cameraName,
      // new BABYLON.Vector3(0, 0, -30),
      // this._scene
      -Math.PI / 2,
      Math.PI / 2,
      5,
      this.person_mesh?.position,
      this._scene,
    );

    camera.lockedTarget = this._camRoot.position;
    // camera.lockedTarget = this.person_mesh?.position;

    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 30;
    camera.lowerAlphaLimit = -Math.PI / 2;
    camera.upperAlphaLimit = -Math.PI / 2;
    camera.lowerBetaLimit = Math.PI / 2;
    camera.upperBetaLimit = Math.PI / 2;

    camera.panningSensibility = 0; // 禁止摄像机平移
    // camera.fov = 0.47350045992678597;
    camera.parent = this._yTilt;
    camera.attachControl(this._scene.getEngine().getRenderingCanvas(), true);
    // camera.attachControl();

    this._scene.activeCamera = camera;
    this._camera = camera;
  };

  /** 更新摄像机位置，保持追随角色 */
  private _updateCamera(): void {
    if (this.person_mesh && this._camRoot) {
      const centerPlayer = this.person_mesh.position.y + 0.5;
      this._camRoot.position = BABYLON.Vector3.Lerp(
        this._camRoot.position,
        new BABYLON.Vector3(
          this.person_mesh.position.x,
          centerPlayer,
          this.person_mesh.position.z,
        ),
        0.4,
      );
      // this._camera.target = BABYLON.Vector3.Lerp(
      //     this._camera.target,
      //     new BABYLON.Vector3(
      //       this.person_mesh.position.x,
      //       centerPlayer,
      //       this.person_mesh.position.z,
      //     ),
      //     0.4,
      //   );
      // const y = ((this._camera.alpha) / Math.PI) * 180 / 5;
      // this._camRoot.rotation = BABYLON.Vector3.Lerp(this._camRoot.rotation, new BABYLON.Vector3(0, y, 0), 0.2);
      // this._camRoot.rotation = new BABYLON.Vector3(0, y, 0);
      // this._camera.alpha = BABYLON.Scalar.Lerp(this._camera.alpha, -Math.PI/2, 0.2);
      // this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
      // /** 从x轴到某一点的角度（弧度单位） */
      // let angle = Math.atan2(
      //   this._camera.beta / Math.PI,
      //   this._camera.alpha / Math.PI,
      // );
      // angle += this._camRoot.rotation.y;
      // /** 通过欧拉旋转角度，生成四元数 */
      // const targ = BABYLON.Quaternion.FromEulerAngles(0, angle, 0);
      // if (this._camRoot.rotationQuaternion) {
      //   this._camRoot.rotationQuaternion = BABYLON.Quaternion.Slerp(
      //     this._camRoot.rotationQuaternion,
      //     targ,
      //     10 * this._deltaTime,
      //   );
      // }
    }
  }

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
    this._updateFromControls();
    if (this.person_mesh) {
      // 使用碰撞引擎移动角色
      this.person_mesh?.moveWithCollisions(this._moveDirection);
      this._animatePlayer();
      // this._floorRaycast();
      this._updateGroundDetection();
    }
  }

  /**
   * 发射射线，来探测角色脚底下是否碰撞到物体
   * @returns 是否在地面上
   */
  private _floorRaycast(): boolean {
    /** 射线发射起点：角色脚底 */
    const raycastFloorPos = new BABYLON.Vector3(
      this.person_mesh.position.x,
      this.person_mesh.position.y + 1,
      this.person_mesh.position.z,
    );
    /** 射线，方向朝下，长度0.6 */
    const ray = new BABYLON.Ray(
      raycastFloorPos,
      BABYLON.Vector3.Up().scale(-1),
      1.5, // 射线长度要比脚底板长多一点，否则当scene每次渲染时，可能探测不及时，导致下陷或探测失败sa
    );

    // const rayHelper = new BABYLON.RayHelper(ray);
    // rayHelper.show(this._scene);

    const pick = this._scene.pickWithRay(
      ray,
      (mesh) => mesh.isPickable && mesh.isEnabled(),
    );

    // if (pick?.hit) {
    //   return Boolean(pick.pickedPoint?.equals(BABYLON.Vector3.Zero()));
    // } else {
    //   return false;
    // }
    let pointer = BABYLON.Vector3.Zero();
    if (pick?.hit) {
      //grounded
      pointer = pick.pickedPoint!;
    }
    // console.log(pointer, pick?.pickedPoint);

    if (pointer.equals(BABYLON.Vector3.Zero())) {
      return false;
    } else {
      return true;
    }
  }

  /** 探测楼梯 */
  private _checkSlope(): boolean {
    const predicat = (mesh: any) => {
      return mesh.isPickable && mesh.isEnabled();
    };

    const raycast_1 = new BABYLON.Vector3(
      this.person_mesh.position.x,
      this.person_mesh.position.y + 0.5,
      this.person_mesh.position.z + 0.25,
    );
    const ray_1 = new Ray(raycast_1, BABYLON.Vector3.Up().scale(-1), 1.5);
    const pick_1 = this._scene.pickWithRay(ray_1, predicat);

    const raycast_2 = new BABYLON.Vector3(
      this.person_mesh.position.x,
      this.person_mesh.position.y + 0.5,
      this.person_mesh.position.z - 0.25,
    );
    const ray_2 = new Ray(raycast_2, BABYLON.Vector3.Up().scale(-1), 1.5);
    const pick_2 = this._scene.pickWithRay(ray_2, predicat);

    const raycast_3 = new BABYLON.Vector3(
      this.person_mesh.position.x + 0.25,
      this.person_mesh.position.y + 0.5,
      this.person_mesh.position.z,
    );
    const ray_3 = new Ray(raycast_3, BABYLON.Vector3.Up().scale(-1), 1.5);
    const pick_3 = this._scene.pickWithRay(ray_3, predicat);

    const raycast_4 = new BABYLON.Vector3(
      this.person_mesh.position.x - 0.25,
      this.person_mesh.position.y + 0.5,
      this.person_mesh.position.z,
    );
    const ray_4 = new Ray(raycast_4, BABYLON.Vector3.Up().scale(-1), 1.5);
    const pick_4 = this._scene.pickWithRay(ray_4, predicat);

    if (pick_1?.hit && !pick_1.getNormal()?.equals(BABYLON.Vector3.Up())) {
      if (pick_1.pickedMesh?.name.includes('stair')) {
        return true;
      }
    } else if (
      pick_2?.hit &&
      !pick_2.getNormal()?.equals(BABYLON.Vector3.Up())
    ) {
      if (pick_2.pickedMesh?.name.includes('stair')) {
        return true;
      }
    } else if (
      pick_3?.hit &&
      !pick_3.getNormal()?.equals(BABYLON.Vector3.Up())
    ) {
      if (pick_3.pickedMesh?.name.includes('stair')) {
        return true;
      }
    } else if (
      pick_4?.hit &&
      !pick_4.getNormal()?.equals(BABYLON.Vector3.Up())
    ) {
      if (pick_4.pickedMesh?.name.includes('stair')) {
        return true;
      }
    }
    return false;
  }

  /**
   * 更新地面探测
   */
  private _updateGroundDetection(): void {
    this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
    // console.log(this._floorRaycast());
    const hit = this._floorRaycast();
    // console.log(hit);
    if (!hit) {
      // 不在地面上
      if (this._checkSlope() && this._gravity.y <= 0) {
        // 在楼梯上，等同于在地上
        this._gravity.y = 0;
        this._jumpCount = 1;
        this.isGrounded = true;
      }
      // if (this._jumped) {
      else {
        this.isGrounded = false;
        // 应用向下的重力
        this._gravity = this._gravity.addInPlace(
          BABYLON.Vector3.Up().scale(this._deltaTime * PersonMove.GRAVITY),
        );
      }
    }

    // 限制重力大小为跳跃力的负值，以免无限增加向下的重力
    if (this._gravity.y < -PersonMove.JUMP_FORCE) {
      this._gravity.y = -PersonMove.JUMP_FORCE;
    }

    // 重力小于0，且跳跃中，说明正在下落
    if (this._gravity.y < 0 && this._jumped) {
      this._isFalling = true;
    }

    // 通过将重力添加到位移向量中，来应用重力效果
    this.person_mesh.moveWithCollisions(
      this._moveDirection.addInPlace(this._gravity),
    );

    if (hit) {
      // 在地面上
      this._gravity.y = 0;
      this.isGrounded = true;
      this._jumpCount = 1;
      this._jumped = false;
      this._isFalling = false;
    }

    /** 按下空格键，且跳跃次数大于0，起跳 */
    if (this._input.jumpKey && this._jumpCount > 0) {
      this._gravity.y = PersonMove.JUMP_FORCE;
      this._jumpCount--;

      this._jumped = true;
      this._isFalling = false;
    }
  }

  /** 根据输入控制更新运动方向 */
  private _updateFromControls(): void {
    this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
    this._moveDirection = BABYLON.Vector3.Zero();
    // this._moveDirection = this._camera.getForwardRay().direction;
    // console.log(this._camera.getDirection(this._camera.position));

    this._h = this._input.horizontal; //right, x
    this._v = this._input.vertical; //fwd, z

    // // --------- run --------- //
    // if (this._input.runKey && this._canRun) {
    //   this._canRun = false;

    // }
    // console.log(this._camera.getFrontPosition(0), this._camRoot.forward);
    // const y = ((this._camera.alpha - (Math.PI/2)) / Math.PI) * 180 / 5;

    // --------- 运动矢量---------- //
    // 获取到摄像机的方向
    const fwd = this._camRoot.forward;
    const right = this._camRoot.right;
    // const fwd = this._camera.
    // const fwd = this._camRoot.forward; // {0,0,1}
    // const right = this._camRoot.rddight; // {1,0,0}
    // console.log(fwd, right);

    // const direction = this._camera.cameraDirection;
    // // console.log(direction);
    // const fwd = new BABYLON.Vector3(direction.x, 0, direction.z);
    // const quat = BABYLON.Quaternion.FromEulerAngles(0, -90, 0);
    // let right = BABYLON.Vector3.Zero();
    // fwd.rotateByQuaternionToRef(quat, right);
    // console.log(fwd, right);

    // 以输入控制器中的当前方向值作为比例，乘以摄像机方向，获取到最终方向
    /** z轴 前后*/
    const correctedVertical = fwd.scaleInPlace(this._v);
    /** x轴 左右*/
    const correctedHorizontal = right.scaleInPlace(this._h);

    // 将z轴方向+x轴方向，获取到最终位移方向矢量值---该值结合了水平和垂直方向运动
    /** 相机当前的运动矢量 */
    const move = correctedHorizontal.addInPlace(correctedVertical);

    // 清除y方向 避免角色飞起来
    this._moveDirection = new BABYLON.Vector3(
      move.normalize().x,
      0,
      move.normalize().z,
    );

    /** 水平、垂直运动的影响因子 */
    const inputMag = Math.abs(this._h) + Math.abs(this._v);
    // _inputAmt在[0-1]之间。避免在对角线移动时，速度过快
    if (inputMag < 0) {
      this._inputAmt = 0;
    } else if (inputMag > 1) {
      this._inputAmt = 1;
    } else {
      this._inputAmt = inputMag;
    }

    /** 获取方向*速度的结果方向 */
    this._moveDirection = this._moveDirection.scaleInPlace(
      this._inputAmt * (this._input.runKey ? this.run_speed : this.walk_speed),
    );
    // console.log(this._moveDirection, this._input.runKey);

    // --------- 旋转方向 ---------- //
    /** 检查是否有移动，来确定是否需要旋转 */
    const input = new BABYLON.Vector3(
      this._input.horizontalAxis,
      0,
      this._input.verticalAxis,
    );
    // console.log(input, input.length());
    // 判断三元数的长度，如果没有输入，则不计算角色的旋转。并且在控制器中会重置旋转方向为0
    if (input.length() === 0) {
      return;
    }

    /** 从x轴到某一点的角度（弧度单位） */
    let angle = Math.atan2(
      this._input.horizontalAxis,
      this._input.verticalAxis,
    );
    angle += this._camRoot.rotation.y;
    /** 通过欧拉旋转角度，生成四元数 */
    const targ = BABYLON.Quaternion.FromEulerAngles(0, angle, 0);
    if (this.person_mesh.rotationQuaternion) {
      // 在两个四元数之间平缓更新
      this.person_mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(
        this.person_mesh.rotationQuaternion,
        targ,
        10 * this._deltaTime,
      );
    }

    this.person_ray.origin = new BABYLON.Vector3(
      this.person_mesh.position.x,
      2,
      this.person_mesh.position.z,
    );
    this.person_ray.direction = fwd;
  }

  /** 导入模型 */
  private async importMesh(url: string): Promise<void> {
    // const outer = BABYLON.MeshBuilder.CreateBox("outer", { width: 2, depth: 1, height: 3 }, this._scene);
    // outer.isVisible = false;
    // outer.isPickable = false;
    // outer.checkCollisions = true;

    // //move origin of box collider to the bottom of the mesh (to match player mesh)
    // outer.bakeTransformIntoVertices(BABYLON.Matrix.Translation(0, 1.5, 0))
    // //for collisions
    // outer.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);
    // outer.ellipsoidOffset = new BABYLON.Vector3(0, 1.5, 0);

    // outer.rotationQuaternion = new BABYLON.Quaternion(0, 1, 0, 0); // rotate the player mesh 180 since we want to see the back of the player
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      url,
      this._scene,
    );
    const body = result.meshes[0] as BABYLON.Mesh;
    this.person_mesh = body;

    this.person_mesh.checkCollisions = true;
    this.person_mesh.bakeTransformIntoVertices(
      BABYLON.Matrix.Translation(0, 1.5, 0),
    );
    this.person_mesh.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);
    this.person_mesh.ellipsoidOffset = new BABYLON.Vector3(0, 1.5, 0);
    this.person_mesh.rotationQuaternion = new BABYLON.Quaternion(0, 1, 0, 0);
    this.person_mesh.isPickable = false;
    this.person_mesh.getChildMeshes().forEach((m) => (m.isPickable = false));
    // 角色不能在（0，0，0）点，需要抬高一点，因为判断了零点作为地面检测条件
    // this.person_mesh.translate(new BABYLON.Vector3(0, 1, 0), 0.1);
    this.person_mesh.position = new BABYLON.Vector3(0, -0.1, 16);

    // this.person_mesh.setPivotPoint(new BABYLON.Vector3(0, 1, 0));

    // body.parent = outer;
    // body.isPickable = false;

    // this.person_mesh = outer;
    // this._camera.parent = this.person_mesh;

    // 模型缩小
    // this.person_mesh.scaling.scaleInPlace(0.1);

    // 坐标轴
    const axes = new BABYLON.AxesViewer(this._scene, 1);
    axes.xAxis.parent = this.person_mesh;
    axes.yAxis.parent = this.person_mesh;
    axes.zAxis.parent = this.person_mesh;

    // 辅助射线
    const ray = new BABYLON.Ray(
      new BABYLON.Vector3(
        this.person_mesh.position.x,
        2,
        this.person_mesh.position.z,
      ),
      this.person_mesh.forward,
      1,
    );
    const rayHelper = new BABYLON.RayHelper(ray);
    rayHelper.show(this._scene);
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
    this.idle();
  }
}
