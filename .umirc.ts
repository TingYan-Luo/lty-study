import { defineConfig } from 'umi';
import routes from './config/routes';

const assetDir = 'static';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes,
  fastRefresh: {},
  layout: {
    // 支持任何不需要 dom 的
    // https://procomponents.ant.design/components/layout#prolayout
    name: 'Demo',
    locale: true,
    layout: 'side',
    headerHeight: 0,
    defaultCollapsed: false,
  },
  chainWebpack(config) {
    config.module
      .rule('gltf')
      .test(/.gltf$/)
      .use('url-loader')
      .loader('url-loader')
      .tap((option) => ({
        ...option,
        name: assetDir + '/gltg/[name].[hash:8].[ext]',
      }));
  },
});
