import * as BABYLON from 'babylonjs';

/**
 * 单个词语点击事件类型
 */
type WordClickFunction = (id: number, text: string) => void;

/**
 * 背景颜色类型
 * [r, g, b, a] >> 数组子项取值范围:[0, 1]
 */
type BgColorType = [number, number, number, number];

type WordCloudProps = {
  /** 字体 */
  font: {
    /** 字体大小 */
    size: number;
    /** 字体颜色 */
    color: string[] | string | Function;
  };
  /** 球体半径 */
  radius: number;
  /** 摄像头半径 */
  cameraRadius: number;
  /** 自动旋转速度: 越大越快；未赋值时不开启自动旋转 */
  autoRotateSpeed?: number;
  /** 场景背景色 */
  backgroundColor?: BgColorType;
  /** 单个词语点击事件 */
  onWordClick?: Function;
};

/**
 * 3D-词云
 */
export default class WordCloud {
  /** 场景对象 */
  private _scene: BABYLON.Scene;

  /** 自动旋转动画 */
  private autoRotateAnimation: undefined | any;

  /** 字体大小 */
  public fontSize: number;
  /** 字体颜色 */
  public fontColor: string[] | string | Function;
  /** 球体半径 */
  public radius: number;
  /** 摄像机距离 */
  public cameraRadius: number;
  /** 背景色 */
  public backgroundColor: BgColorType | undefined;

  /** 自旋转速度 */
  public autoRotateSpeed: number | undefined;
  /** 词语点击事件 */
  public onWordClick: WordClickFunction | undefined;

  constructor(props: WordCloudProps, scene: BABYLON.Scene) {
    this._scene = scene;

    this.fontColor = props.font.color;
    this.fontSize = props.font.size;
    this.backgroundColor = props.backgroundColor;
    this.radius = props.radius;
    this.cameraRadius = props.cameraRadius;
    this.autoRotateSpeed = props.autoRotateSpeed;
  }

  /**
   * 自动旋转动画
   * @param mesh 网格
   * @param speed 旋转速度, 越大越快
   */
  private rotateAnim = (mesh: BABYLON.Mesh, speed: number) => {
    this.autoRotateAnimation = BABYLON.Animation.CreateAndStartAnimation(
      'sps-rotate',
      mesh,
      'rotation.y',
      speed,
      500,
      mesh.rotation.y,
      mesh.rotation.y + 360,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    );
  };

  /**
   * 加载摄像机+光照
   */
  private loadCamera = () => {
    const canvas = this._scene.getEngine().getRenderingCanvas();
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      this.cameraRadius,
      new BABYLON.Vector3(0, 0, 0),
      this._scene,
    );
    camera.attachControl(canvas, false, true);
    camera.lowerRadiusLimit = this.cameraRadius;
    camera.upperRadiusLimit = this.cameraRadius;
    /** 灯光 */
    const light = new BABYLON.PointLight(
      'light',
      new BABYLON.Vector3(0, 0, 1),
      this._scene,
    );
    light.specular = BABYLON.Color3.Black();
    this._scene.registerBeforeRender(function () {
      light.position = camera.position;
    });
  };

  /**
   * 创建球形词语粒子系统
   * @param TextList 词语数据
   * @returns 粒子系统对象
   */
  private createSps = (TextList: string[]) => {
    const font = 'bold ' + this.fontSize + 'px Arial';
    let labelHeight = 1.5 * this.fontSize;
    /** 最长的文本长度 */
    let maxLabelLength = 0;
    let maxDynTxtWidth = Math.pow(2, 12);

    let labelx = 0;
    let labely = labelHeight;
    let labelWidth = 0;
    let nextWidth = 0;

    let text = '';

    const temp = new BABYLON.DynamicTexture(
      'DynamicTexture',
      64,
      this._scene,
      true,
    );
    const tmpctx = temp.getContext();
    tmpctx.font = font;

    // 将文字数组聚合到一个临时文本材质中
    for (let i = 0; i < TextList.length; i++) {
      maxLabelLength = Math.max(TextList[i].length, maxLabelLength);

      text = TextList[i];
      labelWidth = tmpctx.measureText(text).width + 4;
      labelx += labelWidth;
      if (i !== TextList.length - 1) {
        nextWidth = tmpctx.measureText(TextList[i + 1]).width + 4;
        if (labelx + nextWidth > maxDynTxtWidth - 8) {
          // totalRowWidth = 0;
          labelx = 0;
          labely += labelHeight;
        }
      }
    }

    const rowPower = Math.ceil(Math.log10(labely) / Math.log10(2));
    const maxDynTxtHeight = Math.pow(2, rowPower);

    const dynamicTexture = new BABYLON.DynamicTexture(
      'DynamicTexture',
      {
        width: maxDynTxtWidth,
        height: maxDynTxtHeight,
      },
      this._scene,
      true,
    );

    const ctx = dynamicTexture.getContext();
    dynamicTexture.hasAlpha = true;

    // 重置参数
    labelWidth = 0;
    labelHeight = 1.5 * this.fontSize;
    labelx = 0;
    labely = labelHeight;

    // 创建粒子系统
    const SPS = new BABYLON.SolidParticleSystem('SPS', this._scene, {
      isPickable: true,
    });

    // 计算每个粒子在球体的位置
    const myPositionFunction = (particle: any, i: any) => {
      const phi = Math.acos(-1 + (2 * i) / TextList.length);
      const theta = Math.sqrt(TextList.length * Math.PI) * phi;
      // console.log(i, theta);

      particle.position.x = Math.cos(theta) * Math.sin(phi) * this.radius;
      particle.position.y = Math.sin(theta) * Math.sin(phi) * this.radius;
      particle.position.z = Math.cos(phi) * -this.radius;

      // console.log(i, particle.position.x, particle.position.y, particle.position.z);

      particle.uvs.x = labelx / maxDynTxtWidth;
      particle.uvs.y =
        (maxDynTxtHeight - labely - labelHeight / 2) / maxDynTxtHeight;
      particle.uvs.z = (labelx + labelWidth) / maxDynTxtWidth;
      particle.uvs.w =
        (maxDynTxtHeight - labely - labelHeight / 2 + labelHeight) /
        maxDynTxtHeight;
    };
    // 开启广告牌模式
    SPS.billboard = true;

    // 为每个粒子配置文本材质
    for (let i = 0; i < TextList.length; i++) {
      // 文本
      text = TextList[i];

      let color: any = this.fontColor;
      if (typeof this.fontColor === 'function') {
        color = (this.fontColor as Function)(text, i);
      } else if (Array.isArray(this.fontColor)) {
        color = this.fontColor[i % this.fontColor.length];
      }

      // 绘制粒子的文本材质
      dynamicTexture.drawText(
        text,
        labelx + 2,
        labely + 2,
        font,
        color,
        null,
        true,
      );
      // 获取文本材质的宽度
      labelWidth = ctx.measureText(text).width + 4;

      // 创建文本网格
      const labelMesh = BABYLON.MeshBuilder.CreatePlane(
        'plane',
        {
          width: labelWidth / 50,
          height: labelHeight / 50,
        },
        this._scene,
      );

      // 粒子系统增加单个粒子，并计算其位置
      SPS.addShape(labelMesh, 1, { positionFunction: myPositionFunction });

      labelx += labelWidth;

      labelMesh.dispose();

      if (i !== TextList.length - 1) {
        nextWidth = ctx.measureText(TextList[i]).width + 4;
        if (labelx + nextWidth > maxDynTxtWidth - 8) {
          labelx = 0;
          labely += labelHeight;
        }
      }
    }

    const mat = new BABYLON.StandardMaterial('mat', this._scene);
    mat.diffuseTexture = dynamicTexture;
    const mesh = SPS.buildMesh();
    mesh.material = mat;

    SPS.setParticles();

    this._scene.registerBeforeRender(function () {
      SPS.setParticles();
    });

    return SPS;
  };

  /**
   * 加载词云
   * @param TextList 词语数据
   * @param onWordClick 单击词语事件
   */
  public load = (TextList: string[], onWordClick?: WordClickFunction) => {
    this.loadCamera();

    if (this.backgroundColor) {
      this._scene.clearColor = new BABYLON.Color4(...this.backgroundColor);
    }

    const SPS = this.createSps(TextList);

    // 自旋转动画
    if (this.autoRotateSpeed) {
      this.rotateAnim(SPS.mesh, this.autoRotateSpeed);
    }

    // 点击词语事件
    if (onWordClick) {
      this.onWordClick = onWordClick;
      SPS.mesh.enablePointerMoveEvents = true;
      this._scene.onPointerMove = (evt, pickInfo) => {
        const canvas = this._scene.getEngine().getRenderingCanvas();
        if (canvas) {
          canvas.style.cursor = 'pointer';
        }
        const meshFaceId = pickInfo.faceId; // get the mesh picked face
        if (meshFaceId === -1) {
          this.autoRotateAnimation?.restart();
          if (canvas) {
            canvas.style.cursor = 'default';
          }
          return;
        }
        this.autoRotateAnimation?.pause();
      };

      this._scene.onPointerDown = (evt, pickResult) => {
        const meshFaceId = pickResult.faceId; // get the mesh picked face
        if (meshFaceId === -1) {
          return;
        }
        const picked = SPS.pickedParticle(pickResult); // get the picked particle data : idx and faceId
        if (picked) {
          onWordClick?.(picked.idx, TextList[picked.idx]);
        }
        SPS.setParticles();
      };
    }
  };
}
