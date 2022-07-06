import { FC, useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';
import { TextList } from './mock';
import WordCloud from './cloud';

const colors = ['#ff4d4f', '#eaff8f', '#40a9ff'];

const BabylonDemo: FC<any> = () => {
  /** 字体大小 */
  const font_size = 44;
  /** 词语点击事件 */
  const onClick = (index: number, text: string) => {
    alert(`click, ${text}, ${index}`);
  };
  const ref = useRef<any>(null);

  /** 初始化 */
  const init = () => {
    const engine = new BABYLON.Engine(ref.current);

    // 创建场景
    const scene = new BABYLON.Scene(engine);
    scene.debugLayer.show();

    engine.runRenderLoop(() => {
      scene.render();
    });

    const cloud = new WordCloud(
      {
        font: {
          size: font_size,
          color: colors,
        },
        radius: 10,
        cameraRadius: 30,
        autoRotateSpeed: 0.1,
        backgroundColor: [15 / 255, 33 / 255, 89 / 255, 1],
      },
      scene,
    );
    cloud.load(TextList, onClick);
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
