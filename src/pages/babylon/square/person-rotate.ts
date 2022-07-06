import * as BABYLON from 'babylonjs';

export default class PersonRotate {
  /** 场景 */
  public _scene: BABYLON.Scene;
  /** 人物跟随相机 */
  public _camera!: BABYLON.ArcRotateCamera;

  /** 人物网格 */
  private person_mesh!: BABYLON.AbstractMesh;

  /** 人物：走路速度 */
  public walk_speed: number = 0.05;
  /** 人物：旋转速度 */
  public rotate_spped: number = 0.1;

  /** 是否在动画运行中 */
  private animating: boolean = false;

  /** 人物动画-走路 */
  private anim_walk: BABYLON.AnimationGroup | undefined;
  /** 人物动画-跑步 */
  private anim_run: BABYLON.AnimationGroup | undefined;
  /** 人物动画-站立 */
  private anim_idle: BABYLON.AnimationGroup | undefined;

  /** 输入按键状态 */
  private input_states:
    | {
        [key: string]: boolean;
      }
    | undefined;

  constructor(url: string, scene: BABYLON.Scene) {
    this._scene = scene;
    this.keyboradListener();
    this.loadCamera();
    this.importMesh(url);
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

  /**
   * 注册键盘监听事件
   * 记录下键盘当前按键是否按下
   */
  private keyboradListener = () => {
    this._scene.actionManager = new BABYLON.ActionManager(this._scene);
    this._scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger,
        (e) => {
          const { key, type } = e.sourceEvent;
          this.input_states = {
            ...(this.input_states || {}),
            [key]: type === 'keydown',
          };
        },
      ),
    );
    this._scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyUpTrigger,
        (e) => {
          const { key, type } = e.sourceEvent;
          this.input_states = {
            ...(this.input_states || {}),
            [key]: type === 'keydown',
          };
        },
      ),
    );
  };

  /** 停止移动，站立动作 */
  private idle = () => {
    this.anim_run!.stop();
    this.anim_walk!.stop();
    this.anim_idle!.play();
  };

  /** 动画 */
  private renderAnimation = (start: boolean, key?: string) => {
    if (start) {
      if (!this.animating) {
        this.animating = true;
        if (key) {
          this.anim_walk?.start(
            true,
            1.0,
            key === 's' ? this.anim_walk.to : this.anim_walk.from,
            key === 's' ? this.anim_walk.from : this.anim_walk.to,
            false,
          );
        }
      }
    } else if (this.animating) {
      this.idle();
      this.animating = false;
    }
  };

  /** 注册人物位移 */
  private regeistAction = () => {
    this._scene.onBeforeRenderObservable.add(() => {
      if (
        !this.input_states?.['w'] &&
        !this.input_states?.['a'] &&
        !this.input_states?.['s'] &&
        !this.input_states?.['d']
      ) {
        this.renderAnimation(false);
      }

      if (this.input_states?.['w']) {
        this.person_mesh.moveWithCollisions(
          this.person_mesh.forward.scaleInPlace(this.walk_speed),
        );
        this.renderAnimation(true, 'w');
      }

      if (this.input_states?.['s']) {
        this.person_mesh.moveWithCollisions(
          this.person_mesh.forward.scaleInPlace(-this.walk_speed / 2),
        );
        this.renderAnimation(true, 's');
      }

      if (this.input_states?.['a']) {
        this.person_mesh.rotate(BABYLON.Vector3.Up(), -this.rotate_spped);
        this.renderAnimation(true, 'a');
      }

      if (this.input_states?.['d']) {
        this.person_mesh.rotate(BABYLON.Vector3.Up(), this.rotate_spped);
        this.renderAnimation(true, 'd');
      }
    });
  };

  /** 导入模型 */
  private importMesh = async (url: string) => {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      '',
      url,
      this._scene,
    );
    this.person_mesh = result.meshes[0];

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

    this._camera.lockedTarget = this.person_mesh;
    this.regeistAction();
  };
}
