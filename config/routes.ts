export default [
  {
    path: '/',
    component: '@/pages/home',
  },
  {
    path: '/web',
    name: 'web',
    icon: 'ChromeOutlined',
    routes: [
      {
        path: '/web/math',
        component: '@/pages/web/math/index',
        name: '算法',
      },
      {
        path: '/web/pie-chart-3',
        component: '@/pages/web/pie-chart-3/index',
        name: '3d饼图',
      },
    ],
  },
  {
    path: '/webGl',
    component: '@/pages/webgl',
    name: 'WebGL',
    icon: 'coffee',
  },
  {
    // path: '/babylon',
    // component: '@/pages/babylon',
    name: 'Babylon',
    icon: 'build',
    path: '/babylon',
    routes: [
      {
        path: '/babylon/demo',
        component: '@/pages/babylon/demo/index',
        name: '房屋',
      },
      {
        path: '/babylon/snake',
        component: '@/pages/babylon/snake/index',
        name: '贪吃蛇',
      },
      {
        path: '/babylon/city',
        component: '@/pages/babylon/city/index',
        name: '城市',
      },
      {
        path: '/babylon/preview',
        component: '@/pages/babylon/preview/index',
        name: '预览',
      },
      {
        path: '/babylon/picture',
        component: '@/pages/babylon/picture/index',
        name: '画卷',
      },
      {
        path: '/babylon/word-cloud',
        component: '@/pages/babylon/word-cloud/index',
        name: '词云',
      },
      {
        path: '/babylon/square',
        component: '@/pages/babylon/square/index',
        name: '广场',
      },
    ],
  },
  {
    name: 'Babylon+D3',
    icon: 'BarcodeOutlined',
    path: '/babylon-d3',
    routes: [
      {
        path: '/babylon-d3/demo',
        component: '@/pages/babylon-d3/demo/index',
        name: '小项目',
      },
    ],
  },
  {
    name: 'Three',
    icon: 'HeatMapOutlined',
    path: '/three',
    routes: [
      {
        path: '/three/preview',
        component: '@/pages/three/preview/index',
        name: '预览',
      },
    ],
  },
];
