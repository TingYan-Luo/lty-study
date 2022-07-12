import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { debounce } from 'lodash';
import { memo, useEffect, useRef } from 'react';

import Importer from './importer';
import Painting from './painting';

import './index.less';

/**
 * 导入模型配置项参数
 */
export type ImporterOptionTypes = {
  /** 环境反射贴图文件 */
  envUrl?: string;
  /** 摄像机参数 */
  camera?: {
    autoRotate?: boolean;
    rotateSpeed?: number;
    beta?: number;
    alpha?: number;
    radius?: number;
  };
};

interface CollectionProps {
  /** 导入文件ulr */
  url: string;
  /**
   * 文件类型
   * IMAGE: 图片；
   * MODEL: 建模；
   */
  type: 'IMAGE' | 'MODEL' | string;
  /** 导入参数 */
  options?: ImporterOptionTypes;
  className?: string;
  style?: any;
  /** 获取场景对象 */
  getScene?: (scene: BABYLON.Scene) => void;
  theme?: 'white' | 'black' | string;
  onLoad?: () => void;
  loadingRef?: HTMLElement;
  /** 当前浏览器无法支持时的回调函数 */
  onNonsupport?: () => void;
  /** 默认图片 */
  defaultImage?: string;
}

/** 数字藏品组件 */
const Collection: React.FC<CollectionProps> = ({
  className,
  url,
  options = {},
  type,
  theme = 'white',
  getScene,
  onLoad,
  loadingRef,
  onNonsupport,
  defaultImage,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BABYLON.Scene>(null);
  // const engineRef = useRef<BABYLON.Engine>(null);

  const isSupport = BABYLON.Engine.IsSupported;

  if (!isSupport) {
    onNonsupport?.();
  }

  /** 初始化加载页面 */
  const initLoading = () => {
    const dom = loadingRef;
    // console.log(dom);
    BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = () => {
      if (dom) {
        dom.style.display = 'flex';
      }
    };

    BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function () {
      if (dom) {
        dom.style.display = 'none';
      }
    };
  };

  const initScene = () => {
    const engine = new BABYLON.Engine(ref.current, undefined, {
      useHighPrecisionMatrix: true,
    });
    const scene = new BABYLON.Scene(engine);

    scene.createDefaultCamera(true, true, false);
    // const camera = new BABYLON.FreeCamera('defaultCamera', new BABYLON.Vector3(0, 5, -10), scene);
    // camera.setTarget(BABYLON.Vector3.Zero());
    scene.createDefaultLight();
    scene.lights[0].intensity = 0.3;

    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    engine.runRenderLoop(() => {
      scene.render();
    });

    // @ts-ignore
    // engineRef.current = engine;
    // @ts-ignore
    sceneRef.current = scene;

    scene.debugLayer.show();
    return { scene, engine };
  };

  const initModel = debounce(async () => {
    if (sceneRef.current) {
      sceneRef.current.getEngine().displayLoadingUI();
      await new Importer(url, options, sceneRef.current, () => {
        sceneRef.current?.getEngine().hideLoadingUI();
        onLoad?.();
      });
    }
  });

  const initImage = async () => {
    if (sceneRef.current) {
      await new Painting(
        url,
        {
          autoRotateAngle: 0.5,
          ratio: 0.65,
        },
        options,
        sceneRef.current,
      );
    }
  };

  useEffect(() => {
    if (!isSupport) {
      return;
    }
    initLoading();
  }, [loadingRef]);

  useEffect(() => {
    if (!isSupport) {
      return;
    }

    if (ref.current && !sceneRef.current) {
      // 阻止web端触控屏缩放浏览器
      ref.current?.addEventListener('wheel', (e: any) => {
        if (e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
        }
      });

      const { engine } = initScene();

      window.addEventListener(
        'resize',
        debounce(() => {
          engine.resize();
        }),
      );

      return () => {
        window.removeEventListener('resize', () => {
          console.log('remove');
        });
      };
    }
  }, [ref.current]);

  useEffect(() => {
    if (!isSupport) {
      return;
    }

    if (sceneRef.current) getScene?.(sceneRef.current);
  }, [sceneRef, getScene]);

  useEffect(() => {
    if (!isSupport) {
      return;
    }

    if (!sceneRef.current?.getMeshById('__root__')) {
      switch (type?.toUpperCase()) {
        case 'MODEL':
          initModel();
          break;
        case 'IMAGE':
          initImage();
          break;
        default:
          break;
      }
    }
  }, [type, url, options]);

  if (
    // type?.toUpperCase() === 'IMAGE'
    // ||
    !isSupport
  ) {
    return (
      <div className={`collection-img collection-img-${theme} ${className}`}>
        <img src={`https://s.newscdn.cn/collection-components/${theme}.png`} />
        <div className="collection-img-content">
          <img src={type?.toUpperCase() === 'IMAGE' ? url : defaultImage} />
        </div>
      </div>
    );
  }

  return (
    <div className={`collection-container ${className}`}>
      <canvas
        ref={ref}
        className="collection-canvas"
        onScroll={(e) => e.preventDefault()}
      />
    </div>
  );
};

export default memo(Collection);
