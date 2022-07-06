import { useEffect, useRef } from 'react';
import styles from './index.less';

// Vertex shader program 顶点着色器
const vsSource = `
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

// 片段着色器
const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

export default function IndexPage() {
  const ref = useRef<any>(null);
  //
  //  初始化着色器程序，让WebGL知道如何绘制我们的数据
  const initShaderProgram = (
    gl: {
      VERTEX_SHADER: any;
      FRAGMENT_SHADER: any;
      createProgram: () => any;
      attachShader: (arg0: any, arg1: any) => void;
      linkProgram: (arg0: any) => void;
      getProgramParameter: (arg0: any, arg1: any) => any;
      LINK_STATUS: any;
      getProgramInfoLog: (arg0: any) => string;
    },
    vsSource: string,
    fsSource: string,
  ) => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // 创建着色器程序

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // 创建失败， alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        'Unable to initialize the shader program: ' +
          gl.getProgramInfoLog(shaderProgram),
      );
      return null;
    }

    return shaderProgram;
  };

  //
  // 创建指定类型的着色器，上传source源码并编译
  //
  const loadShader = (
    gl: {
      VERTEX_SHADER?: any;
      FRAGMENT_SHADER?: any;
      createProgram?: () => any;
      attachShader?: (arg0: any, arg1: any) => void;
      linkProgram?: (arg0: any) => void;
      getProgramParameter?: (arg0: any, arg1: any) => any;
      LINK_STATUS?: any;
      getProgramInfoLog?: (arg0: any) => string;
      createShader?: any;
      shaderSource?: any;
      compileShader?: any;
      getShaderParameter?: any;
      COMPILE_STATUS?: any;
      getShaderInfoLog?: any;
      deleteShader?: any;
    },
    type: any,
    source: string,
  ) => {
    const shader = gl.createShader(type); // 创建一个新的着色器

    // Send the source to the shader object

    gl.shaderSource(shader, source); // 将源码发送给着色器

    // Compile the shader program

    gl.compileShader(shader); // 着色器编译源码

    // See if it compiled successfully
    // 获取着色器状态
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(
        'An error occurred compiling the shaders: ' +
          gl.getShaderInfoLog(shader),
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  // 创建一个缓冲器来存储它的顶点
  const initBuffers = (gl: {
    createBuffer: () => any;
    bindBuffer: (arg0: any, arg1: any) => void;
    ARRAY_BUFFER: any;
    bufferData: (arg0: any, arg1: Float32Array, arg2: any) => void;
    STATIC_DRAW: any;
  }) => {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var vertices = [
      1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    return {
      position: positionBuffer,
    };
  };

  useEffect(() => {
    if (ref?.current) {
      //通过方法getContext()获取WebGL上下文
      const gl = ref.current.getContext('webgl'); // 2d | webgl
      if (!gl) {
        alert('无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。');
        return;
      }

      // 使用完全不透明的黑色清除所有图像
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      // 用上面指定的颜色清除缓冲区
      gl.clear(gl.COLOR_BUFFER_BIT);

      const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(
            shaderProgram,
            'aVertexPosition',
          ),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(
            shaderProgram,
            'uProjectionMatrix',
          ),
          modelViewMatrix: gl.getUniformLocation(
            shaderProgram,
            'uModelViewMatrix',
          ),
        },
      };
    }
  }, []);
  return (
    <canvas ref={ref} id="box" style={{ width: '100%', height: '100%' }} />
  );
}
