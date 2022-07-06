import * as BABYLON from 'babylonjs';

export default class InputControl {
  public _scene: BABYLON.Scene;

  public input_states: any = {};

  /** z轴旋转比例 */
  public vertical: number = 0;
  public verticalAxis: number = 0;
  /** x轴旋转比例 */
  public horizontal: number = 0;
  public horizontalAxis: number = 0;

  public runKey: boolean = false;
  public jumpKey: boolean = false;

  public command = {
    frameTime: 0,
    moveForwardKeyDown: false,
    moveBackwardKeyDown: false,
    moveLeftKeyDown: false,
    moveRightKeyDown: false,
    jumpKeyDown: false,
    cameraAlpha: 0,
    cameraBeta: 0,
  };

  constructor(scene: BABYLON.Scene) {
    this._scene = scene;

    this.keyboradListener();

    this._scene.onBeforeRenderObservable.add(() => {
      // 由于希望有一个平滑的转换，因此利用scene的每次渲染来平滑更新方向
      this._updateFromKeyboard();
    });
  }

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
          if (this.input_states && !this.input_states[key]) {
            this.input_states = {
              ...(this.input_states || {}),
              [key]: type === 'keydown',
            };
          }
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

  /**
   * 当按下[w,s]键时，逐渐降低vertical值，以便于有一个平滑的转换
   * 当按下[a,d]键时，逐渐降低horizontal值，以便于有一个平滑的转换
   *
   * 当您按住键时，它会逐渐将值增加到1或 -1。
   * 我们正在追踪我们移动的轴/方向
   * 如果我们在一个轴上没有检测到任何输入，我们将方向和值都设置为0
   */
  private _updateFromKeyboard = () => {
    this._scene.onBeforeRenderObservable.add(() => {
      if (this.input_states['w']) {
        this.vertical = BABYLON.Scalar.Lerp(this.vertical, 1, 0.2);
        // x轴的反方向
        this.verticalAxis = -1;
      } else if (this.input_states['s']) {
        this.vertical = BABYLON.Scalar.Lerp(this.vertical, -1, 0.2);
        this.verticalAxis = 1;
      } else {
        // 没有上下方向变化，重置
        this.vertical = 0;
        this.verticalAxis = 0;
      }

      if (this.input_states['a']) {
        this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, -1, 0.2);
        this.horizontalAxis = 1;
      } else if (this.input_states['d']) {
        this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, 1, 0.2);
        this.horizontalAxis = -1;
      } else {
        // 没有左右方向变化，重置
        this.horizontal = 0;
        this.horizontalAxis = 0;
      }
      // console.log(this.input_states['Shift'], this.input_states['w']);
      // 跑
      this.runKey = Boolean(
        this.input_states['Shift'] &&
          (this.input_states['w'] ||
            this.input_states['s'] ||
            this.input_states['a'] ||
            this.input_states['d']),
      );

      // 跳跃
      this.jumpKey = Boolean(this.input_states[' ']);
    });

    this._scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          switch (kbInfo.event.key) {
            case 'w':
            case 'W':
              this.command.moveForwardKeyDown = true;
              break;
            case 'a':
            case 'A':
              this.command.moveLeftKeyDown = true;
              break;
            case 's':
            case 'S':
              this.command.moveBackwardKeyDown = true;
              break;
            case 'd':
            case 'D':
              this.command.moveRightKeyDown = true;
              break;
            case ' ':
              this.command.jumpKeyDown = true;
              break;
          }
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          switch (kbInfo.event.key) {
            case 'w':
            case 'W':
              this.command.moveForwardKeyDown = false;
              break;
            case 'a':
            case 'A':
              this.command.moveLeftKeyDown = false;
              break;
            case 's':
            case 'S':
              this.command.moveBackwardKeyDown = false;
              break;
            case 'd':
            case 'D':
              this.command.moveRightKeyDown = false;
              break;
            case ' ':
              this.command.jumpKeyDown = false;
              break;
          }
          break;
      }
    });
  };
}
