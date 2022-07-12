import * as BABYLON from 'babylonjs';
import Importer from './importer';
import { ImporterOptionTypes } from './index';

type ImgInfoType = {
  rwidth: number;
  rheight: number;
  pwidth: number;
  pheight: number;
  img: HTMLImageElement;
};

type PaintOptionsType = {
  /** 图片自适应最大宽高比 */
  ratio: number;
  /** 自动旋转最大角度，不传表示不自动旋转 */
  autoRotateAngle?: number;
};

export default class Painting {
  private static readonly DEFAULT_FRAME_URL = '/babylon/file/huakuang.glb';
  // 'https://t.newscdn.cn/collection-components/huakuang.glb';
  private Frame: Importer | undefined;
  private _scene: BABYLON.Scene;
  private _options: PaintOptionsType = {
    autoRotateAngle: undefined,
    ratio: 0.65,
  };

  private _img: ImgInfoType | undefined;
  private _paint: BABYLON.Mesh | undefined;

  public _url: string;

  private direction: 'r' | 'l' = 'r';

  constructor(
    url: string,
    options: PaintOptionsType,
    importOptions: ImporterOptionTypes,
    scene: BABYLON.Scene,
  ) {
    this._scene = scene;
    this._url = url;
    this._options = options;
    this.create(importOptions);
  }

  private async create(options: ImporterOptionTypes) {
    const importMesh = await new Importer(
      Painting.DEFAULT_FRAME_URL,
      options,
      this._scene,
      () => {
        this.Frame = importMesh;
        this.getImage();
      },
    );
  }

  private getImage() {
    /** 图片元素 */
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this._url;
    img.onload = () => {
      //Add image to dynamic texture
      // console.log(img, img.width, img.height);
      /** 图片：本身宽度 */
      const rwidth = img.width;
      /** 图片：本身高度 */
      const rheight = img.height;

      /** 图片：宽高比 */
      const ratio = rwidth / rheight;

      /** 图片：缩放宽度 */
      const pwidth = ratio >= 1 ? this._options.ratio || 1 : 1 * ratio;
      /** 图片：缩放高度 */
      const pheight = ratio < 1 ? 1 : (this._options.ratio || 1) / ratio;

      this._img = { rwidth, rheight, pheight, pwidth, img };

      this.insertPaint();
    };
  }

  private autoRotate() {
    if (this.Frame?._importMesh && this._paint) {
      const rootNode = new BABYLON.TransformNode('frame');
      this.Frame._importMesh.parent = rootNode;
      this._paint.parent = rootNode;

      this._scene.getEngine()?.runRenderLoop(() => {
        console.log('angle', this._options.autoRotateAngle);

        if (!this._options.autoRotateAngle) {
          return;
        }

        const rotateY = 0.003;
        if (rootNode.rotation.y >= this._options.autoRotateAngle) {
          this.direction = 'l';
        }

        if (rootNode.rotation.y <= -this._options.autoRotateAngle) {
          this.direction = 'r';
        }
        rootNode.rotation.y += rotateY * (this.direction === 'r' ? 1 : -1);
      });
    }
  }

  private insertPaint() {
    /** 真实图片画板 */
    const painPlane = BABYLON.MeshBuilder.CreatePlane(
      'paint-plane',
      { width: this._img?.pwidth, height: this._img?.pheight },
      this._scene,
    );

    /** 真实画板需要与画框画板错开一点 */
    painPlane.translate(new BABYLON.Vector3(0, 0, 1), -0.0001);
    const dTextrue = new BABYLON.DynamicTexture(
      'pictrue-texture',
      {
        height: this._img?.rheight,
        width: this._img?.rwidth,
      },
      this._scene,
    );

    const textureContext = dTextrue.getContext();
    const paintMat = new BABYLON.StandardMaterial('paint', this._scene);
    paintMat.diffuseTexture = dTextrue;
    paintMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    paintMat.ambientColor = new BABYLON.Color3(1, 1, 1);
    painPlane.material = paintMat;
    textureContext.drawImage(this._img?.img, 0, 0);
    dTextrue.update();

    this._paint = painPlane;

    this.autoRotate();
  }
}
