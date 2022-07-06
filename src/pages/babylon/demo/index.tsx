import { FC, useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
// @ts-ignore
import { BoxList } from './data';
import { groundMaterial } from '../material';
// import animation from './animations.json';

const BabylonDemo: FC<any> = () => {
  const ref = useRef<any>(null);

  const startFrame = 0;
  const endFrame = 10;
  const frameRate = 4;

  /** 天空材质 */
  const sky = (scene: BABYLON.Scene) => {
    const skybox = BABYLON.MeshBuilder.CreateBox(
      'skyBox',
      { size: 1000.0 },
      scene,
    );
    const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      'textures/skybox',
      scene,
    );
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
  };

  /** 材质-屋顶 */
  const rootMaterial = (scene: BABYLON.Scene) => {
    const myMaterial = new BABYLON.StandardMaterial('myMaterial', scene); //创建一个材质
    myMaterial.diffuseColor = new BABYLON.Color3(
      255 / 255,
      106 / 255,
      106 / 255,
    ); //漫反射颜色
    myMaterial.specularColor = new BABYLON.Color3(
      255 / 255,
      106 / 255,
      106 / 255,
    ); //镜面颜色
    myMaterial.emissiveColor = new BABYLON.Color3(
      255 / 255,
      106 / 255,
      106 / 255,
    ); //自发光颜色
    myMaterial.ambientColor = new BABYLON.Color3(1, 1, 1); //环境光颜色
    return myMaterial;
  };

  /** 材质-屋子主题 */
  const houseMaterial = (scene: BABYLON.Scene) => {
    const myMaterial = new BABYLON.StandardMaterial('myMaterial', scene); //创建一个材质

    myMaterial.diffuseColor = new BABYLON.Color3(
      245 / 255,
      245 / 255,
      220 / 255,
    ); //漫反射颜色
    myMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87); //镜面颜色
    // myMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);//自发光颜色
    myMaterial.ambientColor = new BABYLON.Color3(1, 1, 1); //环境光颜色
    return myMaterial;
  };

  /** 材质-黑色 */
  const blackMaterial = (scene: BABYLON.Scene) => {
    const myMaterial = new BABYLON.StandardMaterial('myMaterial', scene); //创建一个材质

    myMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); //漫反射颜色
    myMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87); //镜面颜色
    // myMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);//自发光颜色
    myMaterial.ambientColor = new BABYLON.Color3(1, 1, 1); //环境光颜色
    return myMaterial;
  };

  /** 材质-灯光 */
  const moonMaterial = (scene: BABYLON.Scene) => {
    const myMaterial = new BABYLON.StandardMaterial('moon', scene);

    // myMaterial.diffuseColor = new BABYLON.Color3(245 / 255, 245 / 255, 220 / 255);//漫反射颜色
    // myMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);//镜面颜色
    myMaterial.emissiveColor = BABYLON.Color3.White(); //自发光颜色
    // myMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);//环境光颜色
    return myMaterial;
  };

  /** 房屋 */
  const house = (
    scene: BABYLON.Scene,
    position: { x: number; y: number; z: number },
    rotationY: number,
  ) => {
    const { x, y, z } = position;
    /** 创建立方体 */
    const box = BABYLON.MeshBuilder.CreateBox(
      'box',
      { width: 0.8, height: 1, depth: 0.8 },
      scene,
    );
    box.position.y = y;
    box.position.x = x;
    box.position.z = z;

    // 旋转
    box.rotation.y = BABYLON.Tools.ToRadians(rotationY);
    // 位移
    // box.translate(new BABYLON.Vector3(4, 0, -1), 1, BABYLON.Space.LOCAL);
    box.material = houseMaterial(scene);
    /** 屋顶 */
    const roof = BABYLON.MeshBuilder.CreateCylinder(
      'roof',
      { diameter: 1.2, tessellation: 3, height: 1 },
      scene,
    );
    // roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = BABYLON.Tools.ToRadians(rotationY);
    roof.position.y = y + 0.8;
    roof.position.x = x;
    roof.position.z = z;

    roof.material = rootMaterial(scene);

    const myHouse = BABYLON.Mesh.MergeMeshes(
      [roof, box],
      true,
      false,
      undefined,
      false,
      true,
    );
    return myHouse;
  };

  /** 易拉罐 */
  const can = (
    scene: BABYLON.Scene,
    position: { x: number; y: number; z: number },
  ) => {
    const { x, y, z } = position;

    const faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0, 0, 0, 0);
    faceUV[1] = new BABYLON.Vector4(1, 0, 0.25, 1); // x, z swapped to flip image
    faceUV[2] = new BABYLON.Vector4(0, 0, 0.24, 1);

    const faceColors = [];
    faceColors[0] = new BABYLON.Color4(0.5, 0.5, 0.5, 1);

    const myCan = BABYLON.MeshBuilder.CreateCylinder(
      'can',
      { faceUV, faceColors },
      scene,
    );
    const canMaterial = new BABYLON.StandardMaterial('myCan', scene);

    canMaterial.diffuseTexture = new BABYLON.Texture(
      'https://assets.babylonjs.com/environments/logo_label.jpg',
      scene,
    );
    myCan.material = canMaterial;

    myCan.scaling.y = 0.1;
    myCan.scaling.x = 0.1;
    myCan.scaling.z = 0.1;

    myCan.translate(new BABYLON.Vector3(x, y, z), 10);
    myCan.rotation.y = BABYLON.Tools.ToRadians(-60);

    return myCan;
  };

  /** 火柴人 */
  const people = (
    scene: BABYLON.Scene,
    position: { x: number; y: number; z: number },
    rotationY?: number,
  ) => {
    const { x, y, z } = position;
    const head = BABYLON.MeshBuilder.CreateSphere(
      'head',
      { diameter: 0.2 },
      scene,
    );
    head.translate(new BABYLON.Vector3(x, y, z), 1, BABYLON.Space.LOCAL);
    head.material = rootMaterial(scene);

    const leftHandEndPosition = { x: x - 0.5, y, z };
    const leftHand = [
      new BABYLON.Vector3(x, y - 0.2, z),
      new BABYLON.Vector3(
        leftHandEndPosition.x,
        leftHandEndPosition.y,
        leftHandEndPosition.z,
      ),
    ];

    const rightHand = [
      new BABYLON.Vector3(x, y - 0.2, z),
      new BABYLON.Vector3(x + 0.2, y - 0.3, z),
      new BABYLON.Vector3(x, y - 0.5, z),
    ];

    const rightLeg = [
      new BABYLON.Vector3(x, y / 2, z),
      new BABYLON.Vector3(x + 0.2, 0, z),
    ];

    const leftLeg = [
      new BABYLON.Vector3(x, y / 2, z),
      new BABYLON.Vector3(x - 0.2, y / 4, z),
      new BABYLON.Vector3(x, 0, z),
    ];

    const leftHandLine = BABYLON.MeshBuilder.CreateLines(
      'leftHand',
      { points: leftHand },
      scene,
    );
    const rightHandLine = BABYLON.MeshBuilder.CreateLines(
      'rightHand',
      { points: rightHand },
      scene,
    );
    const rightLegLine = BABYLON.MeshBuilder.CreateLines(
      'rightLeg',
      { points: rightLeg },
      scene,
    );
    const leftLegLine = BABYLON.MeshBuilder.CreateLines(
      'leftLeg',
      { points: leftLeg },
      scene,
    );

    const body = BABYLON.MeshBuilder.CreateCylinder(
      'body',
      { diameter: 0.05, height: y / 2 },
      scene,
    );
    body.translate(
      new BABYLON.Vector3(x, (y / 3) * 2, z),
      1,
      BABYLON.Space.LOCAL,
    );
    body.material = blackMaterial(scene);

    const myCan = can(scene, leftHandEndPosition);

    const myPeople = BABYLON.Mesh.MergeMeshes(
      [head, body],
      true,
      false,
      undefined,
      false,
      true,
    );
    myCan.setParent(myPeople);
    leftHandLine.setParent(myPeople);
    rightHandLine.setParent(myPeople);
    rightLegLine.setParent(myPeople);
    leftLegLine.setParent(myPeople);

    return myPeople;
  };

  /** 月亮 */
  const moon = (
    scene: BABYLON.Scene,
    position: { x: number; y: number; z: number },
  ) => {
    const { x, y, z } = position;
    const myMoon = BABYLON.MeshBuilder.CreateSphere('moon', {}, scene);

    myMoon.translate(new BABYLON.Vector3(x, y, z), 1);

    myMoon.material = moonMaterial(scene);

    // 创建发光层
    const gl = new BABYLON.GlowLayer('glow', scene, {
      // mainTextureFixedSize: 1024, // 模糊形状固定大小
      // blurKernelSize: 64,
      mainTextureSamples: 10,
    });
    // gl.intensity = 0.5;

    // gl.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
    //   if (mesh.name === "lightsaber") {
    //       result.set(1, 0, 1, 1);
    //   } else {
    //       result.set(0, 0, 0, 0);
    //   }
    // }

    gl.addIncludedOnlyMesh(myMoon);

    return myMoon;
  };

  /** 指针拖拽 */
  const dragBehavior = () => {
    const pointDragBehavior = new BABYLON.PointerDragBehavior({
      dragAxis: new BABYLON.Vector3(0, 1, 0), // 将沿着提供的轴进行拖动
      // dragPlaneNormal: new BABYLON.Vector3(1, 0, 0), // 将沿着法线定义的平面进行拖动
    });

    // 默认情况下，拖动平面/轴将根据对象的方向进行修改。要将指定的轴/平面固定在世界上，需要设置false
    pointDragBehavior.useObjectOrientationForDragging = false;

    // 默认情况下，拖动平面将在每一帧上更新。禁止更新
    pointDragBehavior.updateDragPlane = false;

    // 监听开始拖拽
    pointDragBehavior.onDragStartObservable.add((event) => {
      console.log('drag-start ->>', event);
    });

    pointDragBehavior.onDragObservable.add((event) => {
      console.log('drag-ing ->>', event);
    });

    pointDragBehavior.onDragEndObservable.add((event) => {
      console.log('drag-end ->>', event);
    });

    // pointDragBehavior.moveAttached = false;
    return pointDragBehavior;
  };

  /** 六向拖拽 */
  const sixDragBehavior = () => {
    const dragBehavior = new BABYLON.SixDofDragBehavior();

    return dragBehavior;
  };

  /** 多指针缩放 */
  const multiPointScraleBehavior = () => {
    const scraleBehavior = new BABYLON.MultiPointerScaleBehavior();

    return scraleBehavior;
  };

  /** 边界框 */
  const boundingBox = (scene: BABYLON.Scene, mesh: BABYLON.Mesh) => {
    const bounding =
      BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(mesh);
    // Create bounding box gizmo
    const utilLayer = new BABYLON.UtilityLayerRenderer(scene);
    utilLayer.utilityLayerScene.autoClearDepthAndStencil = false;
    const gizmo = new BABYLON.BoundingBoxGizmo(
      BABYLON.Color3.FromHexString('#0984e3'),
      utilLayer,
    );
    gizmo.attachedMesh = bounding;

    return bounding;
  };

  /** 月亮动画 */
  const moonAnimation = (initY: number) => {
    const frame = new BABYLON.Animation(
      'moon',
      'position.y',
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    );
    const keyFrames = [];
    keyFrames.push({
      frame: startFrame,
      value: initY + 0.2,
    });
    keyFrames.push({
      frame: endFrame / 2,
      value: initY,
    });
    keyFrames.push({
      frame: endFrame,
      value: initY + 0.2,
    });

    frame.setKeys(keyFrames);
    // console.log(frame);
    return frame;
  };

  // 远程引入动画文件
  const getAnimationJson = async () => {
    const animations = await BABYLON.Animation.ParseFromFileAsync(
      null,
      'https://',
    );
    console.log(animations);
    return animations;
  };

  /** GUI */
  const initGUI = () => {};

  /** 初始化 */
  const init = () => {
    const engine = new BABYLON.Engine(ref.current);
    // console.log('engine', engine);

    // 创建场景
    const scene = new BABYLON.Scene(engine);
    scene.debugLayer.show();
    // 配置场景重力
    // scene.gravity = new BABYLON.Vector3(0, -0.9, 0);

    engine.runRenderLoop(() => {
      scene.render();
    });

    // window.addEventListener("resize", () => {
    //   engine.resize();
    // });

    // 创建摄像机
    /**
     * name: 相当于我们平时理解的id或者key，全局唯一
     * alpha: 初始水平方向旋转弧度
     * beta: 初始垂直方向旋转弧度
     * radius: 距离旋转中心点的半径
     * target: 旋转中心坐标
     * scene: 所在场景
     */
    // 弧形旋转相机
    // const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene);

    // // 通用相机，可以操作第一人称视角
    // const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(1, 1.5, -5), scene);

    // //相机观察的目标，在这里表示：相机放在(0,0,-10)，镜头对准观察 (0,0,0)
    // camera.setTarget(BABYLON.Vector3.Zero());

    // // 相机响应用户操作
    // camera.attachControl(ref.current, true);

    // // 通用相机开启滚轮缩小放大
    // camera.inputs.addMouseWheel();

    // // 定义相机碰撞体积
    // camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      new BABYLON.Vector3(1, 1.5, -5),
      scene,
    );
    camera.attachControl(ref.current, false, true);
    camera.wheelDeltaPercentage = 0.01;
    /** 快捷开启默认相机 */
    // scene.createDefaultCamera(true);

    // scene.clearColor = BABYLON.Color4.FromColor3(new BABYLON.Color3(100 / 255, 149 / 255, 237 / 255));

    // sky(scene);
    /** 灯光 */
    const light = new BABYLON.DirectionalLight(
      'light',
      new BABYLON.Vector3(-1, -3, 1),
      scene,
    );
    // 调整光照强度
    light.intensity = 0.8;
    light.position = new BABYLON.Vector3(3, 9, 3);
    // 漫反射光颜色
    // light.diffuse = BABYLON.Color3.Red();
    // light.specular = BABYLON.Color3.Green();
    // 导入房屋模型
    // BABYLON.SceneLoader.ImportMeshAsync(["ground", "semi_house"], "https://assets.babylonjs.com/meshes/", "both_houses_scene.babylon");
    // const loader = new BABYLON.AssetsManager(scene);
    // const cube = loader.addMeshTask('test', 'cube', './', 'test.gltf');

    // console.log('cube', cube);

    const generator = new BABYLON.ShadowGenerator(512, light);

    /** 场景球体 */
    // const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);

    /** 地面 */
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 10, height: 10 },
      scene,
    );
    ground.material = groundMaterial(scene); //mesh是之前创建的物体
    ground.receiveShadows = true;

    const h1 = house(scene, { x: -2, y: 0.5, z: 1 }, 45);
    if (h1) {
      generator.addShadowCaster(h1);

      BoxList.map((item, index) => {
        const { x, y, z } = item;
        const clonedHouse = h1.clone('clonedHouse');
        clonedHouse.translate(new BABYLON.Vector3(x, 0, z), 1);
        clonedHouse.rotation.y = BABYLON.Tools.ToRadians(30 * (index + 1));
        generator.addShadowCaster(clonedHouse);
      });
    }

    const p1 = people(scene, { x: 1, y: 1, z: -2 });
    const p2 = people(scene, { x: -1, y: 1, z: -2 });

    if (p1) {
      // const plane = BABYLON.Mesh.CreatePlane("plane", 2, scene);
      // plane.setParent(p1);
      // plane.position.y = 2;
      // const myGUI = GUI.AdvancedDynamicTexture.CreateForMeshTexture(plane);
      // var button1 = GUI.Button.CreateSimpleButton("but1", "Click Me");
      // button1.width = 1;
      // button1.height = 0.4;
      // button1.color = "white";
      // button1.fontSize = 50;
      // button1.background = "green";
      // button1.onPointerUpObservable.add(function() {
      //     alert("you did it!");
      // });
      // myGUI.addControl(button1);

      generator.addShadowCaster(p1);
    }

    if (p2) {
      generator.addShadowCaster(p2);
      p2.rotation.y = BABYLON.Tools.ToRadians(180);
      p2.translate(new BABYLON.Vector3(0, 2, 0), 0.8);
    }

    const m = moon(scene, { x: 0, y: 5, z: 0 });
    if (m) {
      generator.addShadowCaster(m);
      const behavior = dragBehavior();
      const behavior2 = sixDragBehavior();
      const behavior3 = multiPointScraleBehavior();
      m.addBehavior(behavior);
      // const bound = boundingBox(scene, m);
      // bound.addBehavior(behavior3);
      // bound.addBehavior(behavior2);
      // console.log('animation', getAnimationJson());
      // getAnimationJson().then(data => {
      //   console.log('data', data);
      //   m.animations.push(data);
      //   scene.beginAnimation(m, startFrame, endFrame, true);
      // })
      m.animations.push(moonAnimation(5));
      scene.beginAnimation(m, startFrame, endFrame, true);
    }

    // const test = BABYLON.SceneLoader.LoadAssetContainer("./", "test.gltf", scene, function (container) {
    //   var meshes = container.meshes;
    //   var materials = container.materials;
    //   //...

    //   // Adds all elements to the scene
    //   container.addAllToScene();
    // });
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="canvas-container">
      <canvas
        onScroll={(e) => e.preventDefault()}
        ref={ref}
        // style={{ width: '100%', height: 800 }}
      />
    </div>
  );
};

export default BabylonDemo;
