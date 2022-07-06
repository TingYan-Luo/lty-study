import * as BABYLON from 'babylonjs';
// @ts-ignore
import groundTextrue from '../images/ground.webp';

/** 材质-草地 */
export const groundMaterial = (scene: BABYLON.Scene) => {
  const myMaterial = new BABYLON.BackgroundMaterial('groundMaterial', scene); //创建一个材质
  myMaterial.diffuseTexture = new BABYLON.Texture(groundTextrue, scene);
  // 阴影，越小越清晰
  myMaterial.shadowLevel = 0.4;
  return myMaterial;
};

/** 材质-苹果 */
export const appleMaterial = (scene: BABYLON.Scene) => {
  const myMaterial = new BABYLON.StandardMaterial('redMat', scene);
  myMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
  // myMaterial.alpha = 0.5;

  return myMaterial;
};
